"use client";

import { ReactNode } from "react";
import { AppBar, Toolbar, Typography, CssBaseline, Container } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div">
                Project &amp; Task Management
              </Typography>
            </Toolbar>
          </AppBar>
          <Container sx={{ mt: 4, mb: 4 }}>{children}</Container>
        </ThemeProvider>
      </body>
    </html>
  );
}

