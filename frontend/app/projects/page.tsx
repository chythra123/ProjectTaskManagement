"use client";

import { useEffect, useState } from "react";
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
import ListIcon from "@mui/icons-material/List";
import { api } from "../../lib/api";
import { Project } from "../../types/project";

export default function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await api.get<Project[]>("/api/projects");
        setProjects(data);
      } catch (err: any) {
        setError(err.message ?? "Failed to load projects");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Projects</Typography>
        <Button
          component={Link}
          href="/projects/new"
          variant="contained"
          color="primary"
        >
          New Project
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
                <TableCell>Project Name</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.projectId}>
                  <TableCell>{project.projectName}</TableCell>
                  <TableCell>{project.clientName}</TableCell>
                  <TableCell>
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>{project.isActive ? "Yes" : "No"}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      component={Link}
                      href={`/projects/${project.projectId}/edit`}
                      size="small"
                      aria-label="Edit project"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      component={Link}
                      href={`/projects/${project.projectId}/tasks`}
                      size="small"
                      aria-label="View tasks"
                    >
                      <ListIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No projects found.
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

