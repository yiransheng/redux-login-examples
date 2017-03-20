const correctUsername = "test@example.com";
const correctPassword = "password123";

function generateToken() {
  return Array(10)
    .fill(0)
    .map(() => Math.random().toString(32))
    .join("")
    .replace(/[^a-z0-9]/g, "");
}

export function authorize(payload = {}) {
  const { username, password } = payload;

  return new Promise((resolve, reject) => {
    setTimeout(
      () => {
        if (username !== correctUsername) {
          reject(Error("User does not exist, try test@example.com"));
        } else if (password !== correctPassword) {
          reject(Error("Wrong password, try 'password123'"));
        } else {
          resolve({ user: username, token: generateToken() });
        }
      },
      5500
    );
  });
}
