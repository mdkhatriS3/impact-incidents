import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface IncidentStats {
  open: number;
  inProgress: number;
  resolved: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<IncidentStats>({ open: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchStats();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const { data: incidents } = await supabase.from("incidents").select("status");
      
      if (incidents) {
        const stats = incidents.reduce(
          (acc, incident) => {
            if (incident.status === "open") acc.open++;
            else if (incident.status === "in_progress") acc.inProgress++;
            else if (incident.status === "resolved") acc.resolved++;
            return acc;
          },
          { open: 0, inProgress: 0, resolved: 0 }
        );
        setStats(stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your incident management</p>
          </div>
          <Button onClick={() => navigate("/incidents/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            New Incident
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-destructive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.open}</div>
              <Badge variant="destructive" className="mt-2">High Priority</Badge>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.inProgress}</div>
              <Badge className="mt-2 bg-warning text-warning-foreground">Being Resolved</Badge>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.resolved}</div>
              <Badge className="mt-2 bg-success text-success-foreground">Completed</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => navigate("/incidents")} className="justify-start">
              View All Incidents
            </Button>
            <Button variant="outline" onClick={() => navigate("/analytics")} className="justify-start">
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
