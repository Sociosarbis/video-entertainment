import { makeStyles } from '@material-ui/core';

const useBaseStyles = makeStyles((theme) => ({
  btn: {
    backgroundColor: 'var(--color-btn-bg)',
    color: 'var(--color-btn-text)',
  },
  container: {
    backgroundColor: 'var(--color-bg-canvas)',
    color: 'var(--color-text-primary)',
  },
  primary: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.text.primary,
  },
  row: {
    padding: '10px 20px',
  },
}));

export { useBaseStyles };
