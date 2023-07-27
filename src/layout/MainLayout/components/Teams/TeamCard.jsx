import { Tag } from "primereact/tag";
import PropTypes from "prop-types";
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';

export const TeamCard = (props) => {
  console.log("TEAMS", props);
  const setAvatarStyle = (name) => {
    switch (name) {
    case 'W':
      return { backgroundColor: '#16a757', color: '#ffffff' };
    case 'L':
      return { backgroundColor: '#ea5455', color: '#ffffff' };
    default:
      return { backgroundColor: '#4caf50', color: '#ffffff' };
    }
  }
  return (
    <>
      <div className="grid">
        {props.teams &&
        props.teams.map((team) => (
          <div className="col-12 md:col-3" key={team.id}>
            <div className="surface-card shadow-2 border-round p-3">
              <div className="flex flex-column align-items-center border-bottom-1 surface-border pb-3">
                <img
                  src={team.logoUrl}
                  style={{ width: "70px", height: "80px" }}
                />
                <span className="text-xl text-900 font-medium mb-2 mt-2">
                  {team.teamName}
                </span>
                <Tag rounded>{team.userName}</Tag>
              </div>
              <div className="flex justify-content-center pt-3">
                <AvatarGroup>
                  <Avatar className="mr-3" shape="circle" label="W" style={setAvatarStyle('W')} />
                  <Avatar className="mr-3" shape="circle" label="W" style={setAvatarStyle('W')} />
                  <Avatar className="mr-3" shape="circle" label="L" style={setAvatarStyle('L')} />
                  <Avatar className="mr-3" shape="circle" label="W" style={setAvatarStyle('W')} />
                  <Avatar className="mr-3" shape="circle" label="L" style={setAvatarStyle('L')} />
                </AvatarGroup>
              </div>
            </div>
          </div>
        
        ))}
      </div>
    </>
  );
};

TeamCard.propTypes = {
  teams: PropTypes.array.isRequired,
};
