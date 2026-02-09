"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";
import { api } from "../../../../../../lib/api";
import { Task } from "../../../../../../types/task";

const STATUS_OPTIONS = ["New", "InProgress", "Completed"];

export default function EditTaskPage() {
  const params = useParams<{ projectId: string; taskId: string }>();
  const projectId = Number(params.projectId);
  const taskId = Number(params.taskId);
  const router = useRouter();

  const [form, setForm] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTask() {
      try {
        const data = await api.get<Task>(`/api/tasks/${taskId}`);
        setForm({
          taskId: data.taskId,
          projectId: data.projectId,
          title: data.title,
          description: data.description ?? "",
          assignedTo: data.assignedTo ?? "",
          status: data.status,
          dueDate: data.dueDate ? data.dueDate.substring(0, 10) : ""
        });
      } catch (err: any) {
        setError(err.message ?? "Failed to load task");
      } finally {
        setLoading(false);
      }
    }

    if (!Number.isNaN(taskId)) {
      loadTask();
    }
  }, [taskId]);

  const handleChange = (field: keyof Task, value: any) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form || !form.taskId) return;

    setSaving(true);
    setError(null);

    try {
      await api.put<Task, void>(`/api/tasks/${form.taskId}`, form);
      router.push(`/projects/${projectId}/tasks`);
    } catch (err: any) {
      setError(err.message ?? "Failed to update task");
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
    return <Typography>Task not found.</Typography>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} maxWidth={600}>
      <Typography variant="h4" mb={3}>
        Edit Task
      </Typography>

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

