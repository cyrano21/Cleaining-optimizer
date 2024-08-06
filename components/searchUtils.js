export const getUserFloor = (userRole) => {
  const parts = userRole.split("-");
  return parts.length > 1 ? parts[1] : null;
};

export const getFloorRooms = (rooms, floor) => {
  return rooms.filter((room) => room.number.startsWith(floor));
};

export const performSearch = (rooms, searchTerm) => {
  const searchFloor = getUserFloor(searchTerm);
  if (searchFloor) {
    return getFloorRooms(rooms, searchFloor);
  } else {
    return rooms.filter(
      (room) =>
        room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.assignedTo &&
          room.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }
};
