import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface Incident {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  created_at: string;
}

const priorityColors = {
  high: "destructive",
  medium: "default",
  low: "secondary",
} as const;

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchIncident();
    };
    checkAuth();
  }, [id, navigate]);

  const fetchIncident = async () => {
    try {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setIncident(data);
    } catch (error) {
      console.error("Error fetching incident:", error);
      toast({
        title: "Error",
        description: "Failed to load incident",
        variant: "destructive",
      });
      navigate("/incidents");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from("incidents")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setIncident(incident ? { ...incident, status: newStatus } : null);
      toast({
        title: "Success",
        description: "Incident status updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div>Loading...</div>
      </AppLayout>
    );
  }

  if (!incident) {
    return (
      <AppLayout>
        <div>Incident not found</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/incidents")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{incident.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={priorityColors[incident.priority as keyof typeof priorityColors]}>
                    {incident.priority}
                  </Badge>
                  <Badge variant="outline">{incident.category}</Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Created: {new Date(incident.created_at).toLocaleString()}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{incident.description}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <Select value={incident.status} onValueChange={updateStatus}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
