
import { Skeleton } from 'primereact/skeleton';

export const TourneyCardSleton = () => {
  return (
    <div className="card">
      <div className="surface-card shadow-2 border-round p-3">
        <div className="flex mb-3 justify-content-center">
          <div className='align-items-center justify-content-center flex flex-column align-items-center border-bottom-1 surface-border pb-3'>
            <Skeleton width="20rem" className="mb-2"></Skeleton>
            <Skeleton width="10rem" className="mb-2"></Skeleton>
            <Skeleton width="10rem"></Skeleton>
          </div>
        </div>
        <div className="flex justify-content-between pt-3">
          <Skeleton height="2rem" className='border-round-3xl mr-2'></Skeleton>
          <Skeleton height="2rem" className='border-round-3xl'></Skeleton>
        </div>
      </div>
    </div>
  );
}
        