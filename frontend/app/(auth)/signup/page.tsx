// app/(auth)/register/page.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitle, CardDescription } from "@/components/ui/card";
import SignUpForm from "./SignUpForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create account</CardTitle>
          <CardDescription>
            Join CollabraDoc and start collaborating
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* —— interactive bit lives in a client component —— */}
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  );
}
