
import SnapStyleAI from '@/components/SnapStyleAI';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Navigation buttons */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          User ?
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin')}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Admin ?
        </Button>
      </div>
      
      <SnapStyleAI />
    </div>
  );
};

export default Index;
