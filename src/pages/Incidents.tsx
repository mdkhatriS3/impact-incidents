import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";

interface Incident {
  id: string;
  title: string;
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

const statusColors = {
  open: "destructive",
  in_progress: "default",
  resolved: "secondary",
} as const;

export default function Incidents() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchIncidents();
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    filterIncidents();
  }, [incidents, searchTerm, priorityFilter, statusFilter]);

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error("Error fetching incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterIncidents = () => {
    let filtered = incidents;

    if (searchTerm) {
      filtered = filtered.filter((incident) =>
        incident.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((incident) => incident.priority === priorityFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((incident) => incident.status === statusFilter);
    }

    setFilteredIncidents(filtered);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Incidents</h1>
            <p className="text-muted-foreground">Manage and track all incidents</p>
          </div>
          <Button onClick={() => navigate("/incidents/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            New Incident
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search incidents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading ? (
            <p>Loading incidents...</p>
          ) : filteredIncidents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No incidents found</p>
              </CardContent>
            </Card>
          ) : (
            filteredIncidents.map((incident) => (
              <Card
                key={incident.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/incidents/${incident.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-lg font-semibold">{incident.title}</h3>
                      <div className="flex gap-2">
                        <Badge variant={priorityColors[incident.priority as keyof typeof priorityColors]}>
                          {incident.priority}
                        </Badge>
                        <Badge variant={statusColors[incident.status as keyof typeof statusColors]}>
                          {incident.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline">{incident.category}</Badge>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(incident.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
