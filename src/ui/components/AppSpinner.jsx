import { DotLoaderOverlay } from 'react-spinner-overlay'

export const AppSpinner = (loading) => {
  return (
    <>
      <DotLoaderOverlay
        size={20}
        loading={loading} 
        overlayColor="rgba(0, 0, 0, 0.5)"
        color="#35b2b2"
        message={"Loading..."}
      />
    </>
  )
};
