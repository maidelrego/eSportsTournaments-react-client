

export const getRoles = (admin, guest, user) => {
  if (admin.includes(user.toString())) {
    return "Shared Admin";
  } else if (guest.includes(user.toString())) {
    return "Guest";
  } else {
    return "Host";
  }
}

export const permission = (admin, guest, user) => {
  if (admin.includes(user.toString())) {
    return true;
  } else if (guest.includes(user.toString())) {
    return false;
  } else {
    return true;
  }
}
