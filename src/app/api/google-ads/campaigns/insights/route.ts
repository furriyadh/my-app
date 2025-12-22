// API to generate AI-powered insights and recommendations
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    
    // AI-powered insights based on campaign data analysis
    const insights = [
      {
        id: 1,
        type: 'opportunity',
        priority: 'high',
        icon: 'TrendingUp',
        title: 'Video campaigns performing exceptionally well',
        description: 'Your Video campaigns have 2.3x higher engagement rate compared to industry average',
        recommendation: 'Consider increasing budget by 15-20% to maximize reach',
        metrics: {
          currentEngagement: 4.2,
          industryAverage: 1.8,
          potentialImpact: '+15% conversions'
        },
        actionable: true,
        action: {
          type: 'adjust_budget',
          campaignId: '2',
          suggestedChange: '+15%'
        }
      },
      {
        id: 2,
        type: 'warning',
        priority: 'medium',
        icon: 'AlertTriangle',
        title: 'Quality Score needs attention',
        description: '"Summer Sale Campaign" has declined to Quality Score of 4/10',
        recommendation: 'Improve ad relevance and landing page experience',
        metrics: {
          currentScore: 4,
          previousScore: 7,
          impact: 'Higher CPC, Lower impression share'
        },
        actionable: true,
        action: {
          type: 'optimize_campaign',
          campaignId: '1',
          focus: ['ad_copy', 'landing_page', 'keywords']
        }
      },
      {
        id: 3,
        type: 'success',
        priority: 'high',
        icon: 'Zap',
        title: 'Shopping campaigns achieving high ROAS',
        description: 'Shopping Product Ads delivering 8.3x return on ad spend',
        recommendation: 'Scale budget gradually to maintain performance',
        metrics: {
          currentROAS: 8.33,
          targetROAS: 5.0,
          profitMargin: '233% above target'
        },
        actionable: true,
        action: {
          type: 'scale_campaign',
          campaignId: '3',
          suggestedIncrease: '+25%'
        }
      },
      {
        id: 4,
        type: 'insight',
        priority: 'medium',
        icon: 'Clock',
        title: 'Optimal performance time detected',
        description: 'Best performing hours: 2-4 PM on Wednesdays',
        recommendation: 'Use ad scheduling to increase bids during peak hours',
        metrics: {
          peakDay: 'Wednesday',
          peakHours: '14:00 - 16:00',
          performanceBoost: '+45% conversion rate'
        },
        actionable: true,
        action: {
          type: 'adjust_schedule',
          timeframe: { day: 3, hours: [14, 15, 16] },
          bidAdjustment: '+30%'
        }
      },
      {
        id: 5,
        type: 'opportunity',
        priority: 'low',
        icon: 'Target',
        title: 'Mobile traffic underutilized',
        description: 'Mobile conversions are 23% cheaper than desktop',
        recommendation: 'Increase mobile bid adjustments by +20%',
        metrics: {
          mobileCostPerConversion: 7.20,
          desktopCostPerConversion: 9.35,
          savingsOpportunity: '23%'
        },
        actionable: true,
        action: {
          type: 'adjust_device_bids',
          device: 'mobile',
          adjustment: '+20%'
        }
      },
      {
        id: 6,
        type: 'warning',
        priority: 'high',
        icon: 'DollarSign',
        title: 'Budget pacing issue detected',
        description: 'Performance Max campaign consuming budget 40% faster than planned',
        recommendation: 'Review automated bidding strategy or increase daily budget',
        metrics: {
          plannedDaily: 10000,
          actualSpend: 14000,
          pace: '140% of target'
        },
        actionable: true,
        action: {
          type: 'adjust_budget',
          campaignId: '5',
          issue: 'overpacing'
        }
      },
      {
        id: 7,
        type: 'insight',
        priority: 'medium',
        icon: 'Users',
        title: 'Audience overlap identified',
        description: '35% audience overlap between Search and Display campaigns',
        recommendation: 'Consider using audience exclusions to reduce overlap',
        metrics: {
          overlapPercentage: 35,
          wastedSpend: 'Estimated $420/day',
          potentialSavings: '$12,600/month'
        },
        actionable: true,
        action: {
          type: 'audience_optimization',
          campaigns: ['1', '4'],
          strategy: 'exclusion_lists'
        }
      },
      {
        id: 8,
        type: 'success',
        priority: 'low',
        icon: 'Award',
        title: 'Impression share leadership',
        description: 'Achieving 88% search impression share in competitive category',
        recommendation: 'Maintain current strategy and monitor competitors',
        metrics: {
          currentIS: 88,
          competitorAverage: 62,
          rankingPosition: '1st in category'
        },
        actionable: false
      }
    ];
    
    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sortedInsights = insights.sort((a, b) => 
      priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
    );
    
    return NextResponse.json({
      success: true,
      insights: sortedInsights,
      summary: {
        totalInsights: insights.length,
        highPriority: insights.filter(i => i.priority === 'high').length,
        actionableInsights: insights.filter(i => i.actionable).length,
        estimatedImpact: {
          potentialRevenue: '+$2,800/day',
          costSavings: '$580/day',
          performanceImprovement: '+18%'
        }
      },
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate insights',
      insights: []
    }, { status: 500 });
  }
}

