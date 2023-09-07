const templates = {
  friend_request: "{{senderName}} sent you a friend request.",
  online_activity: "{{senderName}} is now online.",
};
  
// Helper function to generate template messages
export const generateTemplateMessage = (type, variables) => {
  if (!templates[type]) {
    throw new Error(`Template type "${type}" not found.`);
  }
  
  let message = templates[type];
  
  for (const variable in variables) {
    const placeholder = `{{${variable}}}`;
    const value = variables[variable];
    message = message.replace(new RegExp(placeholder, 'g'), value);
  }
  
  return message;
}