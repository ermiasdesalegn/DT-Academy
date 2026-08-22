import { CircleAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ParentDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your children</h1>
        <p className="mt-1 text-sm text-muted-foreground">Switch child, pay tuition, then report cards unlock.</p>
      </div>

      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>Tuition unpaid: report card locked</AlertTitle>
        <AlertDescription>
          Please clear this term’s balance to view grades and attendance. Submit a bank PNR or pay with Telebirr /
          M-Pesa. The office must verify cash payments.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <Avatar>
            <AvatarFallback>—</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>Child not linked yet</CardTitle>
            <CardDescription>The office admits the student and attaches this parent account.</CardDescription>
          </div>
          <Badge variant="outline" className="ml-auto">
            Locked
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Preview: after verification, this card shows grade, section, and a report-card summary.
          </p>
          <Button className="mt-4" type="button">
            Pay tuition
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
