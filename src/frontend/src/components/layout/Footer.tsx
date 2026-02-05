import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © 2026. Built with <Heart className="inline h-4 w-4 fill-red-500 text-red-500" /> using{' '}
        <a
          href="https://caffeine.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground hover:underline"
        >
          caffeine.ai
        </a>
      </div>
    </footer>
  );
}
