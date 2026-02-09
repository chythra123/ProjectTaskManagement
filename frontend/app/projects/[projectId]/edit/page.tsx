"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  FormControlLabel,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import { api } from "../../../../lib/api";
import { Project } from "../../../../types/project";

export default function EditProjectPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = Number(params.projectId);

  const [form, setForm] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      try {
        const data = await api.get<Project>(`/api/projects/${projectId}`);
        setForm({
          projectId: data.projectId,
          projectName: data.projectName,
          clientName: data.clientName,
          startDate: data.startDate.substring(0, 10),
          endDate: data.endDate ? data.endDate.substring(0, 10) : "",
          isActive: data.isActive
        });
      } catch (err: any) {
        setError(err.message ?? "Failed to load project");
      } finally {
        setLoading(false);
      }
    }

    if (!Number.isNaN(projectId)) {
      loadProject();
    }
  }, [projectId]);

  const handleChange = (field: keyof Project, value: any) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form || !form.projectId) return;

    setSaving(true);
    setError(null);

    try {
      await api.put<Project, void>(`/api/projects/${form.projectId}`, {
        ...form,
        endDate: form.endDate || null
      });
      router.push("/projects");
    } catch (err: any) {
      setError(err.message ?? "Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return (
      <Typography color="error" mb={2}>
        {error}
      </Typography>
    );
  }

  if (!form) {
    return <Typography>Project not found.</Typography>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} maxWidth={600}>
      <Typography variant="h4" mb={3}>
        Edit Project
      </Typography>

      <TextField
        label="Project Name"
        value={form.projectName}
        onChange={(e) => handleChange("projectName", e.target.value)}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Client Name"
        value={form.clientName}
        onChange={(e) => handleChange("clientName", e.target.value)}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Start Date"
        type="date"
        value={form.startDate}
        onChange={(e) => handleChange("startDate", e.target.value)}
        fullWidth
        required
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="End Date"
        type="date"
        value={form.endDate ?? ""}
        onChange={(e) => handleChange("endDate", e.target.value || null)}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={form.isActive}
            onChange={(e) => handleChange("isActive", e.target.checked)}
          />
        }
        label="Active"
      />

      <Box mt={3} display="flex" gap={2}>
        <Button type="submit" variant="contained" color="primary" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button variant="outlined" onClick={() => router.back()}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
}

