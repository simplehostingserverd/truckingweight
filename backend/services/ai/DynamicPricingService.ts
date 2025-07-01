import { PrismaClient } from '@prisma/client';
import { MLService } from './MLService';

interface MarketData {
  lane: string; // Origin-Destination pair
  averageRate: number;
  rateRange: { min: number; max: number };
  demandLevel: 'low' | 'medium' | 'high' | 'critical';
  supplyLevel: 'oversupply' | 'balanced' | 'tight' | 'critical';
  seasonalFactor: number;
  timestamp: Date;
}

interface FuelData {
  location: string;
  dieselPrice: number;
  gasPrice: number;
  trend: 'rising' | 'falling' | 'stable';
  forecast: number[]; // 7-day forecast
  timestamp: Date;
}

interface CompetitorPricing {
  competitorId: string;
  lane: string;
  rate: number;
  serviceLevel: 'standard' | 'expedited' | 'white_glove';
  equipmentType: string;
  timestamp: Date;
}

interface LoadCharacteristics {
  origin: string;
  destination: string;
  distance: number;
  weight: number;
  equipmentType: string;
  serviceLevel: 'standard' | 'expedited' | 'white_glove';
  pickupDate: Date;
  deliveryDate: Date;
  specialRequirements?: string[];
  customerTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface PricingRecommendation {
  recommendedRate: number;
  rateRange: { min: number; max: number };
  confidence: number; // 0-100
  reasoning: string[];
  marketPosition: 'below_market' | 'at_market' | 'above_market' | 'premium';
  profitMargin: number;
  competitiveAdvantage: string;
  riskFactors: string[];
  adjustmentFactors: {
    fuelSurcharge: number;
    demandMultiplier: number;
    seasonalAdjustment: number;
    customerDiscount: number;
    urgencyPremium: number;
  };
}

interface PricingStrategy {
  strategyType: 'cost_plus' | 'market_based' | 'value_based' | 'competitive' | 'dynamic';
  baseRate: number;
  marginTarget: number;
  flexibilityRange: number; // Percentage range for negotiation
  autoApprovalThreshold: number;
  escalationThreshold: number;
}

interface MarketIntelligence {
  laneAnalysis: {
    lane: string;
    volume: number;
    averageRate: number;
    rateVolatility: number;
    seasonalPattern: number[];
    competitorCount: number;
    marketShare: number;
  }[];
  demandForecast: {
    date: Date;
    expectedDemand: number;
    confidence: number;
  }[];
  pricingOpportunities: {
    lane: string;
    opportunity: string;
    potentialIncrease: number;
    riskLevel: 'low' | 'medium' | 'high';
  }[];
}

export class DynamicPricingService {
  private prisma: PrismaClient;
  private mlService: MLService;

  constructor() {
    this.prisma = new PrismaClient();
    this.mlService = new MLService();
  }

  /**
   * Generate dynamic pricing recommendation for a load
   */
  async generatePricingRecommendation(
    loadCharacteristics: LoadCharacteristics,
    companyId: number
  ): Promise<PricingRecommendation> {
    try {
      // Get market data for the lane
      const marketData = await this.getMarketData(loadCharacteristics.origin, loadCharacteristics.destination);
      
      // Get current fuel prices
      const fuelData = await this.getFuelData(loadCharacteristics.origin);
      
      // Get competitor pricing
      const competitorPricing = await this.getCompetitorPricing(loadCharacteristics);
      
      // Get company's historical pricing and performance
      const historicalData = await this.getHistoricalPricingData(companyId, loadCharacteristics);
      
      // Calculate base rate using multiple methodologies
      const costPlusRate = await this.calculateCostPlusRate(loadCharacteristics, fuelData);
      const marketBasedRate = this.calculateMarketBasedRate(marketData, competitorPricing);
      const valueBasedRate = this.calculateValueBasedRate(loadCharacteristics, marketData);
      
      // Apply ML model for dynamic pricing
      const mlRecommendation = await this.mlService.predictDynamicPricing({
        lane: `${loadCharacteristics.origin}-${loadCharacteristics.destination}`,
        distance: loadCharacteristics.distance,
        weight: loadCharacteristics.weight,
        equipmentType: loadCharacteristics.equipmentType,
        serviceLevel: loadCharacteristics.serviceLevel,
        marketDemand: marketData.demandLevel,
        fuelPrice: fuelData.dieselPrice,
        seasonalFactor: marketData.seasonalFactor,
        competitorAverage: competitorPricing.reduce((sum, c) => sum + c.rate, 0) / competitorPricing.length,
        urgency: loadCharacteristics.urgency,
        customerTier: loadCharacteristics.customerTier
      });
      
      // Calculate adjustment factors
      const adjustmentFactors = this.calculateAdjustmentFactors(
        loadCharacteristics,
        marketData,
        fuelData
      );
      
      // Determine final recommended rate
      const baseRate = mlRecommendation.predictedRate;
      const adjustedRate = this.applyAdjustmentFactors(baseRate, adjustmentFactors);
      
      // Calculate rate range for negotiation
      const rateRange = this.calculateRateRange(adjustedRate, marketData, competitorPricing);
      
      // Determine market position
      const marketPosition = this.determineMarketPosition(adjustedRate, marketData, competitorPricing);
      
      // Calculate profit margin
      const profitMargin = this.calculateProfitMargin(adjustedRate, costPlusRate);
      
      // Generate reasoning and risk factors
      const reasoning = this.generatePricingReasoning(
        adjustedRate,
        marketData,
        fuelData,
        competitorPricing,
        adjustmentFactors
      );
      
      const riskFactors = this.identifyRiskFactors(
        loadCharacteristics,
        marketData,
        competitorPricing
      );
      
      return {
        recommendedRate: Math.round(adjustedRate * 100) / 100,
        rateRange: {
          min: Math.round(rateRange.min * 100) / 100,
          max: Math.round(rateRange.max * 100) / 100
        },
        confidence: mlRecommendation.confidence,
        reasoning,
        marketPosition,
        profitMargin: Math.round(profitMargin * 100) / 100,
        competitiveAdvantage: this.determineCompetitiveAdvantage(adjustedRate, competitorPricing, loadCharacteristics),
        riskFactors,
        adjustmentFactors
      };
    } catch (error) {
      console.error('Error generating pricing recommendation:', error);
      throw error;
    }
  }

  /**
   * Get market data for a specific lane
   */
  private async getMarketData(origin: string, destination: string): Promise<MarketData> {
    // In a real implementation, this would fetch from market data providers like DAT, Truckstop.com, etc.
    // For now, we'll simulate market data
    
    const lane = `${origin}-${destination}`;
    const baseRate = 2.50; // Base rate per mile
    const demandLevels = ['low', 'medium', 'high', 'critical'] as const;
    const supplyLevels = ['oversupply', 'balanced', 'tight', 'critical'] as const;
    
    // Simulate market conditions based on lane characteristics
    const demandLevel = demandLevels[Math.floor(Math.random() * demandLevels.length)];
    const supplyLevel = supplyLevels[Math.floor(Math.random() * supplyLevels.length)];
    
    // Calculate seasonal factor (higher in Q4, lower in Q1)
    const month = new Date().getMonth();
    const seasonalFactor = month >= 9 ? 1.15 : month <= 2 ? 0.85 : 1.0;
    
    // Adjust rate based on demand/supply balance
    let rateMultiplier = 1.0;
    if (demandLevel === 'high' && supplyLevel === 'tight') rateMultiplier = 1.25;
    else if (demandLevel === 'critical' && supplyLevel === 'critical') rateMultiplier = 1.5;
    else if (demandLevel === 'low' && supplyLevel === 'oversupply') rateMultiplier = 0.8;
    
    const averageRate = baseRate * rateMultiplier * seasonalFactor;
    
    return {
      lane,
      averageRate,
      rateRange: {
        min: averageRate * 0.85,
        max: averageRate * 1.15
      },
      demandLevel,
      supplyLevel,
      seasonalFactor,
      timestamp: new Date()
    };
  }

  /**
   * Get fuel data for pricing calculations
   */
  private async getFuelData(location: string): Promise<FuelData> {
    // In a real implementation, this would fetch from fuel price APIs
    // For now, we'll simulate fuel data
    
    const baseDieselPrice = 3.85; // Base diesel price per gallon
    const variation = (Math.random() - 0.5) * 0.5; // ±$0.25 variation
    const dieselPrice = baseDieselPrice + variation;
    
    const trends = ['rising', 'falling', 'stable'] as const;
    const trend = trends[Math.floor(Math.random() * trends.length)];
    
    // Generate 7-day forecast
    const forecast = [];
    let currentPrice = dieselPrice;
    for (let i = 0; i < 7; i++) {
      const dailyChange = trend === 'rising' ? 0.02 : trend === 'falling' ? -0.02 : (Math.random() - 0.5) * 0.04;
      currentPrice += dailyChange;
      forecast.push(Math.round(currentPrice * 100) / 100);
    }
    
    return {
      location,
      dieselPrice: Math.round(dieselPrice * 100) / 100,
      gasPrice: Math.round((dieselPrice - 0.3) * 100) / 100,
      trend,
      forecast,
      timestamp: new Date()
    };
  }

  /**
   * Get competitor pricing data
   */
  private async getCompetitorPricing(loadCharacteristics: LoadCharacteristics): Promise<CompetitorPricing[]> {
    // In a real implementation, this would fetch from competitive intelligence sources
    // For now, we'll simulate competitor data
    
    const competitors = ['Competitor_A', 'Competitor_B', 'Competitor_C', 'Competitor_D'];
    const pricing: CompetitorPricing[] = [];
    
    const baseRate = 2.40; // Slightly lower than market average
    
    for (const competitorId of competitors) {
      const variation = (Math.random() - 0.5) * 0.4; // ±$0.20 variation
      const rate = baseRate + variation;
      
      pricing.push({
        competitorId,
        lane: `${loadCharacteristics.origin}-${loadCharacteristics.destination}`,
        rate: Math.round(rate * 100) / 100,
        serviceLevel: loadCharacteristics.serviceLevel,
        equipmentType: loadCharacteristics.equipmentType,
        timestamp: new Date()
      });
    }
    
    return pricing;
  }

  /**
   * Get historical pricing data for the company
   */
  private async getHistoricalPricingData(companyId: number, loadCharacteristics: LoadCharacteristics) {
    // In a real implementation, this would query historical load data
    // For now, we'll simulate historical performance
    
    return {
      averageRate: 2.45,
      winRate: 0.75, // 75% of quotes result in bookings
      profitMargin: 0.15, // 15% profit margin
      customerSatisfaction: 4.2, // Out of 5
      onTimePerformance: 0.95 // 95% on-time delivery
    };
  }

  /**
   * Calculate cost-plus rate
   */
  private async calculateCostPlusRate(loadCharacteristics: LoadCharacteristics, fuelData: FuelData): Promise<number> {
    // Calculate operational costs
    const driverCost = 0.65; // Per mile
    const fuelCost = (fuelData.dieselPrice / 6.5); // Assuming 6.5 MPG
    const maintenanceCost = 0.15; // Per mile
    const insuranceCost = 0.08; // Per mile
    const equipmentCost = 0.25; // Per mile
    const overheadCost = 0.12; // Per mile
    
    const totalCostPerMile = driverCost + fuelCost + maintenanceCost + insuranceCost + equipmentCost + overheadCost;
    
    // Add profit margin (15%)
    const costPlusRate = totalCostPerMile * 1.15;
    
    // Adjust for service level
    const serviceLevelMultiplier = {
      standard: 1.0,
      expedited: 1.25,
      white_glove: 1.5
    };
    
    return costPlusRate * serviceLevelMultiplier[loadCharacteristics.serviceLevel];
  }

  /**
   * Calculate market-based rate
   */
  private calculateMarketBasedRate(marketData: MarketData, competitorPricing: CompetitorPricing[]): number {
    const marketAverage = marketData.averageRate;
    const competitorAverage = competitorPricing.reduce((sum, c) => sum + c.rate, 0) / competitorPricing.length;
    
    // Weight market data more heavily than competitor data
    return (marketAverage * 0.7) + (competitorAverage * 0.3);
  }

  /**
   * Calculate value-based rate
   */
  private calculateValueBasedRate(loadCharacteristics: LoadCharacteristics, marketData: MarketData): number {
    let baseRate = marketData.averageRate;
    
    // Adjust for urgency
    const urgencyMultiplier = {
      low: 0.95,
      medium: 1.0,
      high: 1.15,
      critical: 1.3
    };
    
    baseRate *= urgencyMultiplier[loadCharacteristics.urgency];
    
    // Adjust for customer tier
    const customerTierMultiplier = {
      bronze: 0.95,
      silver: 1.0,
      gold: 1.05,
      platinum: 1.1
    };
    
    baseRate *= customerTierMultiplier[loadCharacteristics.customerTier];
    
    // Adjust for special requirements
    if (loadCharacteristics.specialRequirements?.length) {
      baseRate *= 1.1; // 10% premium for special requirements
    }
    
    return baseRate;
  }

  /**
   * Calculate adjustment factors
   */
  private calculateAdjustmentFactors(
    loadCharacteristics: LoadCharacteristics,
    marketData: MarketData,
    fuelData: FuelData
  ) {
    // Fuel surcharge based on current fuel prices
    const baseFuelPrice = 3.50;
    const fuelSurcharge = Math.max(0, (fuelData.dieselPrice - baseFuelPrice) * 0.1);
    
    // Demand multiplier
    const demandMultipliers = {
      low: 0.95,
      medium: 1.0,
      high: 1.1,
      critical: 1.2
    };
    const demandMultiplier = demandMultipliers[marketData.demandLevel];
    
    // Seasonal adjustment
    const seasonalAdjustment = marketData.seasonalFactor - 1.0;
    
    // Customer discount based on tier
    const customerDiscounts = {
      bronze: 0,
      silver: 0.02,
      gold: 0.05,
      platinum: 0.08
    };
    const customerDiscount = customerDiscounts[loadCharacteristics.customerTier];
    
    // Urgency premium
    const urgencyPremiums = {
      low: 0,
      medium: 0,
      high: 0.1,
      critical: 0.2
    };
    const urgencyPremium = urgencyPremiums[loadCharacteristics.urgency];
    
    return {
      fuelSurcharge,
      demandMultiplier,
      seasonalAdjustment,
      customerDiscount,
      urgencyPremium
    };
  }

  /**
   * Apply adjustment factors to base rate
   */
  private applyAdjustmentFactors(baseRate: number, factors: any): number {
    let adjustedRate = baseRate;
    
    // Apply fuel surcharge
    adjustedRate += factors.fuelSurcharge;
    
    // Apply demand multiplier
    adjustedRate *= factors.demandMultiplier;
    
    // Apply seasonal adjustment
    adjustedRate *= (1 + factors.seasonalAdjustment);
    
    // Apply urgency premium
    adjustedRate *= (1 + factors.urgencyPremium);
    
    // Apply customer discount
    adjustedRate *= (1 - factors.customerDiscount);
    
    return adjustedRate;
  }

  /**
   * Calculate rate range for negotiation
   */
  private calculateRateRange(
    recommendedRate: number,
    marketData: MarketData,
    competitorPricing: CompetitorPricing[]
  ): { min: number; max: number } {
    const competitorMin = Math.min(...competitorPricing.map(c => c.rate));
    const competitorMax = Math.max(...competitorPricing.map(c => c.rate));
    
    // Set minimum at 5% above lowest competitor or 90% of recommended rate, whichever is higher
    const min = Math.max(competitorMin * 1.05, recommendedRate * 0.9);
    
    // Set maximum at market high or 110% of recommended rate, whichever is lower
    const max = Math.min(marketData.rateRange.max, recommendedRate * 1.1);
    
    return { min, max };
  }

  /**
   * Determine market position
   */
  private determineMarketPosition(
    recommendedRate: number,
    marketData: MarketData,
    competitorPricing: CompetitorPricing[]
  ): 'below_market' | 'at_market' | 'above_market' | 'premium' {
    const marketAverage = marketData.averageRate;
    const competitorAverage = competitorPricing.reduce((sum, c) => sum + c.rate, 0) / competitorPricing.length;
    const overallAverage = (marketAverage + competitorAverage) / 2;
    
    if (recommendedRate < overallAverage * 0.95) return 'below_market';
    if (recommendedRate <= overallAverage * 1.05) return 'at_market';
    if (recommendedRate <= overallAverage * 1.15) return 'above_market';
    return 'premium';
  }

  /**
   * Calculate profit margin
   */
  private calculateProfitMargin(recommendedRate: number, costPlusRate: number): number {
    return ((recommendedRate - costPlusRate) / recommendedRate) * 100;
  }

  /**
   * Generate pricing reasoning
   */
  private generatePricingReasoning(
    recommendedRate: number,
    marketData: MarketData,
    fuelData: FuelData,
    competitorPricing: CompetitorPricing[],
    adjustmentFactors: any
  ): string[] {
    const reasoning: string[] = [];
    
    reasoning.push(`Market demand is ${marketData.demandLevel} with ${marketData.supplyLevel} supply conditions`);
    
    if (adjustmentFactors.fuelSurcharge > 0) {
      reasoning.push(`Fuel surcharge of $${adjustmentFactors.fuelSurcharge.toFixed(2)} applied due to elevated diesel prices`);
    }
    
    if (adjustmentFactors.seasonalAdjustment !== 0) {
      const direction = adjustmentFactors.seasonalAdjustment > 0 ? 'increase' : 'decrease';
      reasoning.push(`Seasonal ${direction} of ${Math.abs(adjustmentFactors.seasonalAdjustment * 100).toFixed(1)}% applied`);
    }
    
    if (adjustmentFactors.urgencyPremium > 0) {
      reasoning.push(`Urgency premium of ${(adjustmentFactors.urgencyPremium * 100).toFixed(1)}% applied for expedited service`);
    }
    
    if (adjustmentFactors.customerDiscount > 0) {
      reasoning.push(`Customer loyalty discount of ${(adjustmentFactors.customerDiscount * 100).toFixed(1)}% applied`);
    }
    
    const competitorAverage = competitorPricing.reduce((sum, c) => sum + c.rate, 0) / competitorPricing.length;
    const competitivePosition = recommendedRate > competitorAverage ? 'above' : 'below';
    reasoning.push(`Rate is ${competitivePosition} competitor average of $${competitorAverage.toFixed(2)}`);
    
    return reasoning;
  }

  /**
   * Determine competitive advantage
   */
  private determineCompetitiveAdvantage(
    recommendedRate: number,
    competitorPricing: CompetitorPricing[],
    loadCharacteristics: LoadCharacteristics
  ): string {
    const competitorAverage = competitorPricing.reduce((sum, c) => sum + c.rate, 0) / competitorPricing.length;
    
    if (recommendedRate < competitorAverage * 0.95) {
      return 'Competitive pricing advantage - 5%+ below market';
    } else if (recommendedRate <= competitorAverage * 1.05) {
      return 'Market-competitive pricing with superior service quality';
    } else {
      return 'Premium pricing justified by specialized service and reliability';
    }
  }

  /**
   * Identify risk factors
   */
  private identifyRiskFactors(
    loadCharacteristics: LoadCharacteristics,
    marketData: MarketData,
    competitorPricing: CompetitorPricing[]
  ): string[] {
    const risks: string[] = [];
    
    if (marketData.demandLevel === 'low') {
      risks.push('Low market demand may require rate flexibility');
    }
    
    if (marketData.supplyLevel === 'oversupply') {
      risks.push('Oversupply conditions may pressure rates downward');
    }
    
    const competitorMin = Math.min(...competitorPricing.map(c => c.rate));
    if (loadCharacteristics.urgency === 'low' && competitorMin < 2.0) {
      risks.push('Low-urgency load vulnerable to aggressive competitor pricing');
    }
    
    if (loadCharacteristics.customerTier === 'bronze') {
      risks.push('Price-sensitive customer segment may negotiate aggressively');
    }
    
    const deliveryDays = Math.ceil((loadCharacteristics.deliveryDate.getTime() - loadCharacteristics.pickupDate.getTime()) / (1000 * 60 * 60 * 24));
    if (deliveryDays > 5) {
      risks.push('Extended delivery window may reduce urgency premium');
    }
    
    return risks;
  }

  /**
   * Get market intelligence and analytics
   */
  async getMarketIntelligence(companyId: number): Promise<MarketIntelligence> {
    try {
      // Get company's active lanes
      const loads = await this.prisma.loads.findMany({
        where: {
          company_id: companyId,
          created_at: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
          }
        },
        select: {
          pickup_location: true,
          delivery_location: true,
          rate_per_mile: true,
          total_weight: true,
          created_at: true
        }
      });
      
      // Analyze lanes
      const laneMap = new Map<string, any[]>();
      loads.forEach(load => {
        const lane = `${load.pickup_location}-${load.delivery_location}`;
        if (!laneMap.has(lane)) {
          laneMap.set(lane, []);
        }
        laneMap.get(lane)!.push(load);
      });
      
      const laneAnalysis = Array.from(laneMap.entries()).map(([lane, laneLoads]) => {
        const rates = laneLoads.map(l => l.rate_per_mile || 0).filter(r => r > 0);
        const averageRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length || 0;
        const rateVolatility = this.calculateVolatility(rates);
        
        return {
          lane,
          volume: laneLoads.length,
          averageRate: Math.round(averageRate * 100) / 100,
          rateVolatility: Math.round(rateVolatility * 100) / 100,
          seasonalPattern: this.calculateSeasonalPattern(laneLoads),
          competitorCount: Math.floor(Math.random() * 5) + 3, // Simulated
          marketShare: Math.random() * 0.15 + 0.05 // 5-20% market share
        };
      });
      
      // Generate demand forecast
      const demandForecast = this.generateDemandForecast();
      
      // Identify pricing opportunities
      const pricingOpportunities = this.identifyPricingOpportunities(laneAnalysis);
      
      return {
        laneAnalysis: laneAnalysis.sort((a, b) => b.volume - a.volume),
        demandForecast,
        pricingOpportunities
      };
    } catch (error) {
      console.error('Error getting market intelligence:', error);
      throw error;
    }
  }

  /**
   * Calculate rate volatility
   */
  private calculateVolatility(rates: number[]): number {
    if (rates.length < 2) return 0;
    
    const mean = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const variance = rates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / rates.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate seasonal pattern
   */
  private calculateSeasonalPattern(loads: any[]): number[] {
    const monthlyVolume = new Array(12).fill(0);
    
    loads.forEach(load => {
      const month = new Date(load.created_at).getMonth();
      monthlyVolume[month]++;
    });
    
    const totalVolume = monthlyVolume.reduce((sum, vol) => sum + vol, 0);
    return monthlyVolume.map(vol => totalVolume > 0 ? vol / totalVolume : 0);
  }

  /**
   * Generate demand forecast
   */
  private generateDemandForecast() {
    const forecast = [];
    const baseDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.getDay();
      
      // Higher demand on weekdays, lower on weekends
      let baseDemand = dayOfWeek >= 1 && dayOfWeek <= 5 ? 100 : 60;
      
      // Add some randomness
      const variation = (Math.random() - 0.5) * 20;
      const expectedDemand = Math.max(0, baseDemand + variation);
      
      forecast.push({
        date,
        expectedDemand: Math.round(expectedDemand),
        confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
      });
    }
    
    return forecast;
  }

  /**
   * Identify pricing opportunities
   */
  private identifyPricingOpportunities(laneAnalysis: any[]) {
    const opportunities = [];
    
    for (const lane of laneAnalysis) {
      // High volume, low volatility lanes are good for rate increases
      if (lane.volume > 10 && lane.rateVolatility < 0.2) {
        opportunities.push({
          lane: lane.lane,
          opportunity: 'Rate increase opportunity on stable, high-volume lane',
          potentialIncrease: 0.05, // 5% increase
          riskLevel: 'low' as const
        });
      }
      
      // Low market share lanes with good rates
      if (lane.marketShare < 0.1 && lane.averageRate > 2.5) {
        opportunities.push({
          lane: lane.lane,
          opportunity: 'Market share growth opportunity with competitive rates',
          potentialIncrease: 0.03, // 3% increase
          riskLevel: 'medium' as const
        });
      }
      
      // High volatility lanes for dynamic pricing
      if (lane.rateVolatility > 0.5) {
        opportunities.push({
          lane: lane.lane,
          opportunity: 'Dynamic pricing opportunity on volatile lane',
          potentialIncrease: 0.1, // 10% increase during peak demand
          riskLevel: 'high' as const
        });
      }
    }
    
    return opportunities;
  }

  /**
   * Get pricing analytics dashboard data
   */
  async getPricingAnalytics(companyId: number, dateRange: { start: Date; end: Date }) {
    const loads = await this.prisma.loads.findMany({
      where: {
        company_id: companyId,
        created_at: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      select: {
        rate_per_mile: true,
        total_weight: true,
        pickup_location: true,
        delivery_location: true,
        created_at: true,
        status: true
      }
    });
    
    const totalRevenue = loads.reduce((sum, load) => sum + (load.rate_per_mile || 0), 0);
    const averageRate = totalRevenue / loads.length || 0;
    const winRate = loads.filter(load => load.status === 'completed').length / loads.length || 0;
    
    return {
      summary: {
        totalQuotes: loads.length,
        totalRevenue: Math.round(totalRevenue),
        averageRate: Math.round(averageRate * 100) / 100,
        winRate: Math.round(winRate * 100),
        profitMargin: 15 // Simulated
      },
      trends: {
        rateGrowth: 0.08, // 8% growth
        volumeGrowth: 0.12, // 12% growth
        marginImprovement: 0.03 // 3% improvement
      },
      recommendations: [
        'Implement dynamic pricing on high-volatility lanes',
        'Increase rates on stable, high-volume lanes by 3-5%',
        'Focus on premium service offerings for higher margins'
      ]
    };
  }
}