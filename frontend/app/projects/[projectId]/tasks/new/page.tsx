"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";
import { api } from "../../../../../lib/api";
import { Task } from "../../../../../types/task";

const STATUS_OPTIONS = ["New", "InProgress", "Completed"];

export default function NewTaskPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params.projectId);
  const router = useRouter();

  const [form, setForm] = useState<Task>({
    projectId,
    title: "",
    description: "",
    assignedTo: "",
    status: "New",
    dueDate: ""
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof Task, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.post<Task, Task>(
        `/api/projects/${projectId}/tasks`,
        form
      );
      router.push(`/projects/${projectId}/tasks`);
    } catch (err: any) {
      setError(err.message ?? "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} maxWidth={600}>
      <Typography variant="h4" mb={3}>
        New Task
      </Typography>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      <TextField
        label="Title"
        value={form.title}
        onChange={(e) => handleChange("title", e.target.value)}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Description"
        value={form.description ?? ""}
        onChange={(e) => handleChange("description", e.target.value)}
        fullWidth
        multiline
        rows={3}
        margin="normal"
      />

      <TextField
        label="Assigned To"
        value={form.assignedTo ?? ""}
        onChange={(e) => handleChange("assignedTo", e.target.value)}
        fullWidth
        margin="normal"
      />

      <TextField
        select
        label="Status"
        value={form.status}
        onChange={(e) => handleChange("status", e.target.value)}
        fullWidth
        required
        margin="normal"
      >
        {STATUS_OPTIONS.map((status) => (
          <MenuItem key={status} value={status}>
            {status}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Due Date"
        type="date"
        value={form.dueDate ?? ""}
        onChange={(e) => handleChange("dueDate", e.target.value || null)}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
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

