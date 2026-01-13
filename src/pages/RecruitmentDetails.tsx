import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, Users, MessageSquare, ChevronRight, Sparkles, Brain, TrendingUp, Briefcase, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MainLayout } from '@/components/layout/MainLayout';
import { fetchRecruitmentById, fetchRecruitments } from '@/lib/database';
import { toast } from 'sonner';

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

const RecruitmentDetails = () => {
  const { id } = useParams();
  const [recruitment, setRecruitment] = useState<DbRecruitment | null>(null);
  const [allRecruitments, setAllRecruitments] = useState<DbRecruitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const [recruitmentData, recruitmentsData] = await Promise.all([
          fetchRecruitmentById(id),
          fetchRecruitments()
        ]);
        setRecruitment(recruitmentData);
        setAllRecruitments(recruitmentsData || []);
      } catch (error) {
        console.error('Error loading recruitment:', error);
        toast.error('Failed to load recruitment details');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  const similarRecruitments = recruitment ? allRecruitments
    .filter((r) => r.id !== recruitment.id && r.category_id === recruitment.category_id)
    .slice(0, 4) : [];

  const handleApply = () => {
    setHasApplied(true);
    toast.success('Application submitted successfully!');
  };

  const handleSubmitReview = () => {
    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    toast.success('Review submitted! Thanks for your feedback.');
    setComment('');
    setUserRating(0);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!recruitment) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Recruitment not found</h2>
          <Link to="/recruitment" className="text-primary hover:underline mt-2 inline-block">
            Browse all opportunities
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto particles-bg">
        {/* Banner */}
        <div className="relative -mx-4 -mt-4 sm:mx-0 sm:rounded-2xl overflow-hidden">
          <img
            src={recruitment.poster}
            alt={recruitment.title}
            className="w-full h-56 sm:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <span className="px-3 py-1 rounded-full bg-secondary/90 text-secondary-foreground text-xs font-medium">
              {recruitment.categories?.name || 'Opportunity'}
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-card/80 backdrop-blur-sm text-xs font-medium">
                <Star className="h-3 w-3 text-orange fill-orange" />
                {recruitment.rating || 0}
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-card/80 backdrop-blur-sm text-xs font-medium">
                <Users className="h-3 w-3 text-primary" />
                {recruitment.rating_count || 0} rated
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="glass-card p-6 space-y-4 animated-border">
          <h1 className="text-2xl font-bold gradient-text">{recruitment.title}</h1>
          <p className="text-muted-foreground">{recruitment.description}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className="text-sm font-medium">{recruitment.deadline}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Society</p>
                <p className="text-sm font-medium">{recruitment.society}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Applicants</p>
                <p className="text-sm font-medium">{recruitment.applicants || 0} people</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="text-sm font-medium">{recruitment.categories?.name || 'General'}</p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              Requirements
            </h3>
            <div className="flex flex-wrap gap-2">
              {(recruitment.requirements || []).map((req) => (
                <span key={req} className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                  {req}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <Button 
          variant="gradient" 
          size="xl" 
          className="w-full neon-glow"
          onClick={handleApply}
          disabled={hasApplied}
        >
          {hasApplied ? '✓ Application Submitted' : 'Apply Now'}
        </Button>

        {/* Rating Section */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Rate This Opportunity</h2>
            <Sparkles className="h-4 w-4 text-orange animate-pulse" />
          </div>
          <p className="text-xs text-muted-foreground -mt-2">Your rating helps improve recommendations</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setUserRating(star)}
                className="text-3xl transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${star <= userRating ? 'text-orange fill-orange' : 'text-muted-foreground hover:text-orange/50'}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-accent" />
            Reviews & Comments
          </h2>
          
          <div className="space-y-3">
            {[1, 2].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-primary-foreground text-xs font-medium">
                    S{i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Student {i + 1}</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3 w-3 ${s <= 4 ? 'text-orange fill-orange' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Great opportunity! The team is very supportive and I learned a lot.</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none bg-muted/30"
            />
            <Button onClick={handleSubmitReview} className="w-full" variant="secondary">
              Submit Review
            </Button>
          </div>
        </div>

        {/* Join Group Button */}
        <Button variant="glass" size="lg" className="w-full">
          <MessageSquare className="h-5 w-5 mr-2" />
          Join Society Group
        </Button>

        {/* AI-Powered Similar Recruitments */}
        {similarRecruitments.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">AI Suggests</h2>
                <Sparkles className="h-4 w-4 text-orange animate-pulse" />
              </div>
              <Link to="/recruitment" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mb-3 -mt-2">Similar opportunities you might like</p>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {similarRecruitments.map((rec, index) => (
                <Link
                  key={rec.id}
                  to={`/recruitment/${rec.id}`}
                  className="flex-shrink-0 w-48 glass-card overflow-hidden group hover:shadow-elevated transition-all duration-300 ai-sparkle"
                >
                  <div className="relative h-28 overflow-hidden">
                    <img
                      src={rec.poster}
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-accent text-[10px] font-medium text-primary-foreground flex items-center gap-1">
                        <Sparkles className="h-2 w-2" />
                        Best Match
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-1">{rec.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{rec.society}</p>
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

export default RecruitmentDetails;