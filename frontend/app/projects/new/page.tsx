"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  FormControlLabel,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import { api } from "../../../lib/api";
import { Project } from "../../../types/project";

export default function NewProjectPage() {
  const router = useRouter();

  const [form, setForm] = useState<Project>({
    projectName: "",
    clientName: "",
    startDate: new Date().toISOString().substring(0, 10),
    endDate: "",
    isActive: true
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof Project, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.post<Project, Project>("/api/projects", {
        ...form,
        endDate: form.endDate || null
      });
      router.push("/projects");
    } catch (err: any) {
      setError(err.message ?? "Failed to create project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} maxWidth={600}>
      <Typography variant="h4" mb={3}>
        New Project
      </Typography>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

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

