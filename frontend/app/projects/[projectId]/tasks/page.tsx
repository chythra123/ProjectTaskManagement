"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { api } from "../../../../lib/api";
import { Task } from "../../../../types/task";
import { Project } from "../../../../types/project";

export default function TaskListPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params.projectId);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [projectData, taskData] = await Promise.all([
          api.get<Project>(`/api/projects/${projectId}`),
          api.get<Task[]>(`/api/projects/${projectId}/tasks`)
        ]);

        setProject(projectData);
        setTasks(taskData);
      } catch (err: any) {
        setError(err.message ?? "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    }

    if (!Number.isNaN(projectId)) {
      loadData();
    }
  }, [projectId]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">Tasks</Typography>
          {project && (
            <Typography variant="subtitle1" color="text.secondary">
              Project: {project.projectName}
            </Typography>
          )}
        </Box>
        <Button
          component={Link}
          href={`/projects/${projectId}/tasks/new`}
          variant="contained"
          color="primary"
        >
          New Task
        </Button>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {!loading && !error && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.taskId}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.assignedTo ?? "-"}</TableCell>
                  <TableCell>{task.status}</TableCell>
                  <TableCell>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      component={Link}
                      href={`/projects/${projectId}/tasks/${task.taskId}/edit`}
                      size="small"
                      aria-label="Edit task"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {tasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No tasks found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}

