const users = [];

// 사용자 고유 색상 생성 함수
const getColorUser = (userId) => {
  const hash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = `hsl(${hash % 360}, 70%, 50%)`; // 쉼표 추가
  return color;
}

// This is the function that will be called when a user joins a room
const addUser = ({ id, userId, name, room }) => {
  // Clean the data
  name = name.trim().toLowerCase();
  //   room = room.trim().toLowerCase();

  // Check for existing user
  console.log("테스트 :", user.room, user.name, user.userId)
  const existingUser = users.find((user) => user.room === room && user.name === name && user.userId === userId)

  // Validate name and room
  if (!name || !room) return { error: '이름과 방이 필요해요.' };

  // Validate username
  if (existingUser) {
    console.log("에러")
    return { error: '이미 존재하는 이름입니다.' };
  }

  // 색상 할당
  const color = getColorUser(userId);

  // Store user
  const user = { id, userId, name, room, cursor: {x:0, y:0}, color};
  users.push(user);
  console.log(users);

  return { user };
}

// This is the function that will be called when a user leaves a room
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// This is the function that will be called when a user sends a message
const getUser = (id) => users.find((user) => user.id === id);

// This is the function that will be called when a user sends a message
const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom };