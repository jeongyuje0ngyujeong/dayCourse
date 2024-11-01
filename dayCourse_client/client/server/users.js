const users = [];

// 사용자 고유 색상 생성 함수
const getColorUser = (userId) => {
  const hash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = `hsl(${hash % 360}, 70%, 50%)`; // 쉼표 추가
  return color;
}

// 사용자 추가 함수
const addUser = ({id, userId, name, room}) => {
  // 데이터 정리
  name = name.trim().toLowerCase();
  //room = room.trim().toLowerCase(); // 방 이름 표준화

  // 기존 사용자 확인
  const existingUser = users.find((user) => user.room === room && user.name === name && user.userId === userId);

  // 이름과 방 유효성 검사
  if (!name || !room) return {error: '이름과 방이 필요해요.'};

  // 사용자 이름 유효성 검사
  if (existingUser) {
    return {error: '이미 존재하는 이름입니다.'};
  }

  // 색상 할당
  const color = getColorUser(userId);

  // 사용자 저장
  const user = {id, userId, name, room, cursor: {x:0, y:0}, color}; // 커서 위치 및 색상 추가
  users.push(user);
  console.log(users);

  return {user};
}

// 사용자 제거 함수
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// 사용자 조회 함수
const getUser = (id) => users.find((user) => user.id === id);

// 특정 방의 사용자 목록 조회 함수
const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = {addUser, removeUser, getUser, getUsersInRoom};