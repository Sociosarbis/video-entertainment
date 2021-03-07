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
  flexNone: {
    flex: 'none',
  },
  flex1: {
    flex: 1,
  },
  column: {
    flexDirection: 'column',
  },
  flex: {
    display: 'flex',
  },
  slideIn: {
    transform: 'perspective(1px) translate3d(0, 0, 0)',
  },
  smallTransition: {
    transition: '100ms transform ease-in',
  },
  slideDownOut: {
    transform: 'perspective(1px) translate3d(0, -100%, 0)',
  },
  absolute: {
    position: 'absolute',
  },
  zIndex1: {
    zIndex: 1,
  },
  flexGrow1: {
    flexGrow: 1,
  },
}));

export { useBaseStyles };
