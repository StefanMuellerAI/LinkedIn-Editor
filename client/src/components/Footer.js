import React, { useState } from 'react';
import {
  Box,
  Typography,
  Link,
  Modal,
  Paper,
  IconButton,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 800,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  overflow: 'auto'
};

export default function Footer() {
  const [impressumOpen, setImpressumOpen] = useState(false);
  const [datenschutzOpen, setDatenschutzOpen] = useState(false);

  return (
    <>
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
          position: 'fixed',
          bottom: 0,
          width: '100%',
          zIndex: 1000
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 3,
            alignItems: 'center'
          }}
        >
          <Link
            component="button"
            variant="body2"
            onClick={() => setImpressumOpen(true)}
            sx={{ cursor: 'pointer' }}
          >
            Impressum
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => setDatenschutzOpen(true)}
            sx={{ cursor: 'pointer' }}
          >
            Datenschutz
          </Link>
        </Box>
      </Box>

      {/* Impressum Modal */}
      <Modal
        open={impressumOpen}
        onClose={() => setImpressumOpen(false)}
      >
        <Paper sx={modalStyle}>
          <IconButton
            onClick={() => setImpressumOpen(false)}
            sx={{ position: 'absolute', top: 10, right: 10 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" component="h2" gutterBottom>
            Impressum
          </Typography>
          <Typography variant="body2">
            [Name des Unternehmens]<br />
            [Straße und Hausnummer]<br />
            [PLZ und Ort]<br />
            <br />
            Vertreten durch:<br />
            [Name des Vertreters]<br />
            <br />
            Kontakt:<br />
            Telefon: [Telefonnummer]<br />
            E-Mail: [E-Mail-Adresse]<br />
            <br />
            Handelsregister: [Registergericht und Nummer]<br />
            USt-IdNr.: [Umsatzsteuer-ID]
          </Typography>
        </Paper>
      </Modal>

      {/* Datenschutz Modal */}
      <Modal
        open={datenschutzOpen}
        onClose={() => setDatenschutzOpen(false)}
      >
        <Paper sx={modalStyle}>
          <IconButton
            onClick={() => setDatenschutzOpen(false)}
            sx={{ position: 'absolute', top: 10, right: 10 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" component="h2" gutterBottom>
            Datenschutzerklärung
          </Typography>
          <Typography variant="body2">
            [Ihre Datenschutzerklärung hier einfügen]
          </Typography>
        </Paper>
      </Modal>
    </>
  );
}
