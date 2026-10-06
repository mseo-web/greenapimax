const BASE_URL = 'https://3100.api.green-api.com';

export interface SendMessagePayload {
  chatId: string;
  message: string;
}

export interface NotificationResponse {
  receiptId: number;
  body: {
    typeWebhook: string;
    instanceData: {
      idInstance: number;
      wid: string;
      typeInstance: string;
    };
    timestamp: number;
    idMessage: string;
    senderData?: {
      chatId: string;
      sender: string;
      senderName: string;
      senderPhoneNumber?: number | string;
    };
    messageData?: {
      typeMessage: string;
      textMessageData?: {
        textMessage: string;
      };
      extendedTextMessageData?: {
        text: string;
      };
    };
  };
}

export const sendMessage = async (
  idInstance: string,
  apiTokenInstance: string,
  chatId: string,
  message: string
) => {
  const response = await fetch(
    `${BASE_URL}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message }),
    }
  );
  return response.json();
};

export const receiveNotification = async (
  idInstance: string,
  apiTokenInstance: string
): Promise<NotificationResponse | null> => {
  const response = await fetch(
    `${BASE_URL}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`
  );
  
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const deleteNotification = async (
  idInstance: string,
  apiTokenInstance: string,
  receiptId: number
) => {
  const response = await fetch(
    `${BASE_URL}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`,
    { method: 'DELETE' }
  );
  return response.json();
};

export interface ContactInfo {
  avatar?: string;
  name?: string;
}

export const fetchContactData = async (
  idInstance: string,
  apiTokenInstance: string,
  chatId: string
): Promise<ContactInfo> => {
  try {
    const [avatarRes, contactRes] = await Promise.all([
      fetch(`${BASE_URL}/waInstance${idInstance}/getAvatar/${apiTokenInstance}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
      }),
      fetch(`${BASE_URL}/waInstance${idInstance}/getContactInfo/${apiTokenInstance}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
      }),
    ]);

    const avatarData = await avatarRes.json();
    console.log('Ответ getAvatar:', avatarData);
    const contactData = await contactRes.json();
    console.log('Ответ contactData:', contactData);

    return {
      avatar: contactData.avatar || avatarData.urlAvatar || undefined,
      name: contactData.name || contactData.contactName || contactData.pushName || chatId,
    };
  } catch (error) {
    console.error('Ошибка при получении данных контакта:', error);
    return { name: chatId };
  }
};
