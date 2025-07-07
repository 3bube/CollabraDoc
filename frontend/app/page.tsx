import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Search, GitBranch, MessageSquare, Zap } from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: Users,
      title: 'Real-time Collaboration',
      description: 'Edit documents together with your team in real-time with live cursors and presence indicators.'
    },
    {
      icon: BookOpen,
      title: 'Technical Wiki',
      description: 'Organize your engineering knowledge with structured documentation and rich text editing.'
    },
    {
      icon: Search,
      title: 'Powerful Search',
      description: 'Find any information instantly with our fuzzy search across all your documentation.'
    },
    {
      icon: GitBranch,
      title: 'Version History',
      description: 'Track changes and collaborate with confidence using built-in version control.'
    },
    {
      icon: MessageSquare,
      title: 'Inline Comments',
      description: 'Discuss specific sections with threaded comments and real-time chat.'
    },
    {
      icon: Zap,
      title: 'Code Execution',
      description: 'Run code snippets directly in your docs with integrated console output.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">CollabraDoc</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Real-time Technical Wiki for{' '}
            <span className="text-primary">Engineering Teams</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create, collaborate, and maintain your technical documentation with live editing, 
            powerful search, and seamless team collaboration.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Start Writing
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything you need for technical documentation
            </h2>
            <p className="text-lg text-muted-foreground">
              Built for engineering teams who value speed, collaboration, and organization.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border bg-card hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to transform your documentation?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join engineering teams who use CollabraDoc to create better documentation faster.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">CollabraDoc</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CollabraDoc. Built for engineering teams.
          </p>
        </div>
      </footer>
    </div>
  );
}