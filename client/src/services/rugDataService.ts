// Service to handle rug data from the existing database
// This ensures all existing rug samples are preserved and accessible

export interface RugData {
  id: string;
  articleNumber: string;
  buyerCode: string;
  construction: string;
  designName: string;
  colour: string;
  size: string;
  material: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'pending' | 'approved' | 'production' | 'completed';
  images: string[];
  createdBy: string;
  // Additional fields from existing schema
  description?: string;
  specifications?: any;
  costingData?: any;
  productionNotes?: string;
}

class RugDataService {
  private baseUrl = '/api/rugs';

  async getAllRugs(): Promise<RugData[]> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rugs = await response.json();
      console.log(`Fetched ${rugs.length} rugs from database`);
      return rugs;
    } catch (error) {
      console.error('Error fetching rugs:', error);
      throw error;
    }
  }

  async getRugById(id: string): Promise<RugData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching rug:', error);
      throw error;
    }
  }

  async getRugsByUser(userId: string): Promise<RugData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user rugs:', error);
      throw error;
    }
  }

  async createRug(rugData: Partial<RugData>): Promise<RugData> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rugData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating rug:', error);
      throw error;
    }
  }

  async updateRug(id: string, updateData: Partial<RugData>): Promise<RugData> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating rug:', error);
      throw error;
    }
  }

  async deleteRug(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting rug:', error);
      throw error;
    }
  }

  // Utility methods for data filtering and searching
  filterRugsByStatus(rugs: RugData[], status: string): RugData[] {
    return rugs.filter(rug => rug.status === status);
  }

  searchRugs(rugs: RugData[], searchTerm: string): RugData[] {
    const lowercaseSearch = searchTerm.toLowerCase();
    return rugs.filter(rug => 
      rug.articleNumber.toLowerCase().includes(lowercaseSearch) ||
      rug.designName.toLowerCase().includes(lowercaseSearch) ||
      rug.buyerCode.toLowerCase().includes(lowercaseSearch) ||
      rug.colour.toLowerCase().includes(lowercaseSearch)
    );
  }

  // Statistics and analytics
  getRugStatistics(rugs: RugData[]) {
    const total = rugs.length;
    const byStatus = rugs.reduce((acc, rug) => {
      acc[rug.status] = (acc[rug.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentRugs = rugs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return {
      total,
      byStatus,
      recentRugs,
      draft: byStatus.draft || 0,
      pending: byStatus.pending || 0,
      approved: byStatus.approved || 0,
      production: byStatus.production || 0,
      completed: byStatus.completed || 0,
    };
  }
}

export const rugDataService = new RugDataService();
export default rugDataService;