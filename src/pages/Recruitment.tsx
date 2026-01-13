import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { fetchRecruitments, fetchCategories } from '@/lib/database';

interface DbRecruitment {
  id: string;
  title: string;
  description: string;
  category_id: string | null;
  poster: string;
  society: string;
  deadline: string;
  requirements: string[];
  rating: number;
  rating_count: number;
  applicants: number;
  categories?: { name: string; icon: string } | null;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

const Recruitment = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recruitments, setRecruitments] = useState<DbRecruitment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [recruitmentsData, categoriesData] = await Promise.all([
          fetchRecruitments(),
          fetchCategories()
        ]);
        setRecruitments(recruitmentsData || []);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error loading recruitments:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredRecruitments = recruitments.filter((rec) => {
    if (selectedCategory) {
      return rec.category_id === selectedCategory;
    }
    return true;
  });

  // Count recruitments per category
  const categoriesWithCount = categories.map(cat => ({
    ...cat,
    count: recruitments.filter(r => r.category_id === cat.id).length
  }));

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold gradient-text">Join Societies</h1>
        <p className="text-muted-foreground">Find your community and grow with like-minded peers</p>

        {/* Categories Grid */}
        {!selectedCategory && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categoriesWithCount.slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="glass-card p-6 text-center hover:shadow-elevated transition-all duration-300 group"
                >
                  <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{cat.count} positions</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recruitments List */}
        {selectedCategory && (
          <>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="text-muted-foreground"
              >
                ← Back to Categories
              </Button>
              <span className="text-sm text-muted-foreground">
                {filteredRecruitments.length} positions found
              </span>
            </div>

            <div className="space-y-4">
              {filteredRecruitments.map((recruitment) => (
                <Link
                  key={recruitment.id}
                  to={`/recruitment/${recruitment.id}`}
                  className="glass-card overflow-hidden flex group hover:shadow-elevated transition-all duration-300"
                >
                  <div className="w-28 sm:w-36 h-36 flex-shrink-0 overflow-hidden">
                    <img
                      src={recruitment.poster}
                      alt={recruitment.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold line-clamp-1">{recruitment.title}</h3>
                        <div className="flex items-center gap-1 text-xs bg-card px-2 py-0.5 rounded-full">
                          <Star className="h-3 w-3 text-orange fill-orange" />
                          {recruitment.rating || 0}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{recruitment.society}</p>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Deadline: {recruitment.deadline}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {(recruitment.requirements || []).slice(0, 2).map((req) => (
                            <span key={req} className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-medium">
                              {req}
                            </span>
                          ))}
                        </div>
                        <Button size="sm" variant="gradient" className="h-8">
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* All Recruitments Preview */}
        {!selectedCategory && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Open Positions ({recruitments.length})</h2>
              <button className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              {recruitments.map((recruitment) => (
                <Link
                  key={recruitment.id}
                  to={`/recruitment/${recruitment.id}`}
                  className="glass-card p-4 hover:shadow-elevated transition-all duration-300 block"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={recruitment.poster}
                      alt={recruitment.title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{recruitment.title}</h3>
                      <p className="text-xs text-muted-foreground">{recruitment.society}</p>
                      <p className="text-xs text-orange mt-1">Deadline: {recruitment.deadline}</p>
                    </div>
                    <Button size="sm" variant="secondary">
                      Apply
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
};

export default Recruitment;