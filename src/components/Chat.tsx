import React, { useState, useEffect } from 'react';
import { IoSendOutline, IoRefreshOutline, IoSearchOutline, IoCallOutline, IoVideocamOutline, IoArrowBackOutline } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { fetchContactData, sendMessage, receiveNotification, deleteNotification } from '../api/greenApi';
import type { ContactInfo } from '../api/greenApi';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
}

export const Chat: React.FC = () => {
  const { idInstance, apiTokenInstance } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeChatId, setActiveChatId] = useState('');
  const [contact, setContact] = useState<ContactInfo>({ name: '' });
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cleanNumber = (id: string) => id.replace(/\D/g, '');

  const formatPhone = (phone: string) => {
    const cleaned = cleanNumber(phone);
    if (!cleaned) return '';
    if (cleaned.length === 11) {
      return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
    }
    return `+${cleaned}`;
  };

  useEffect(() => {
    if (!activeChatId) return;

    const formatted = formatPhone(activeChatId);
    setContact({ name: formatted, avatar: '' });

    fetchContactData(idInstance, apiTokenInstance, activeChatId).then((data) => {
      if (data) {
        setContact({
          name: data.name || formatted,
          avatar: data.avatar || '',
        });
      }
    });
  }, [activeChatId, idInstance, apiTokenInstance]);

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cleanNumber(phoneNumber);
    if (cleaned) {
      setActiveChatId(`${cleaned}@c.us`);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChatId) return;

    const textToSend = messageText.trim();
    setMessageText('');

    try {
      const res = await sendMessage(idInstance, apiTokenInstance, activeChatId, textToSend);
      if (res?.idMessage) {
        setMessages((prev) => [
          ...prev,
          {
            id: res.idMessage,
            text: textToSend,
            sender: 'me',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (error) {
      console.error('Ошибка отправки:', error);
    }
  };

  const handleCheckNotifications = async () => {
    setIsLoading(true);
    try {
      const notification = await receiveNotification(idInstance, apiTokenInstance);

      if (notification && notification.receiptId) {
        const body = notification.body;

        if (body && body.messageData) {
          const text =
            body.messageData.textMessageData?.textMessage ||
            body.messageData.extendedTextMessageData?.text ||
            '';

          const senderId = body.senderData?.chatId || '';
          const senderPhone = body.senderData?.senderPhoneNumber ? String(body.senderData.senderPhoneNumber) : '';
          const activeClean = cleanNumber(activeChatId);

          if (text) {
            const isCurrentChat = activeChatId
              ? cleanNumber(senderId) === activeClean || cleanNumber(senderPhone) === activeClean
              : true;

            if (isCurrentChat) {
              setMessages((prev) => [
                ...prev,
                {
                  id: body.idMessage || Date.now().toString(),
                  text,
                  sender: 'them',
                  timestamp: new Date((body.timestamp || Date.now() / 1000) * 1000).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                },
              ]);
            }
          }
        }

        await deleteNotification(idInstance, apiTokenInstance, notification.receiptId);
      }
    } catch (error) {
      console.error('Ошибка получения уведомления:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] border border-stroke dark:border-stroke-dark rounded-xl overflow-hidden bg-white dark:bg-gray-dark shadow-one">
      <div className="w-1/3 border-r border-stroke dark:border-stroke-dark p-4 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-black dark:text-white">Новый чат</h3>
        <form onSubmit={handleStartChat} className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Номер телефона (например, 77071234567)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-stroke dark:border-stroke-dark bg-transparent text-black dark:text-white focus:outline-none focus:border-primary text-sm"
          />
          <button
            type="submit"
            className="bg-primary text-white py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition"
          >
            Открыть чат
          </button>
        </form>

        {activeChatId && (
          <div className="mt-4 p-3 rounded-lg bg-gray-light dark:bg-bg-color-dark border border-stroke dark:border-stroke-dark flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500 text-white overflow-hidden shrink-0 flex items-center justify-center font-semibold text-sm">
              {contact.avatar ? (
                <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
              ) : (
                contact.name ? contact.name[0].toUpperCase() : '👤'
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-black dark:text-white truncate">
                {contact.name}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="w-2/3 flex flex-col justify-between bg-gray-light/30 dark:bg-bg-color-dark/30">
        {activeChatId ? (
          <>
            <div className="p-3 bg-white dark:bg-gray-dark border-b border-stroke dark:border-stroke-dark flex justify-between items-center">
              <div className="flex items-center gap-3 min-w-0">
                <button className="text-gray-400 hover:text-white transition">
                  <IoArrowBackOutline className="w-5 h-5" />
                </button>

                <div className="w-9 h-9 rounded-full bg-red-500 text-white overflow-hidden shrink-0 flex items-center justify-center font-semibold text-sm">
                  {contact.avatar ? (
                    <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                  ) : (
                    contact.name ? contact.name[0].toUpperCase() : '👤'
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-black dark:text-white truncate">
                    {contact.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCheckNotifications}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-white text-xs font-medium hover:bg-opacity-90 disabled:opacity-50 transition shrink-0"
                >
                  <IoRefreshOutline className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Проверить сообщения
                </button>

                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-400">
                  <button className="p-1 hover:text-white transition"><IoCallOutline className="w-5 h-5" /></button>
                  <button className="p-1 hover:text-white transition"><IoVideocamOutline className="w-5 h-5" /></button>
                  <button className="p-1 hover:text-white transition"><IoSearchOutline className="w-5 h-5" /></button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-y-auto p-4 space-y-3 relative bg-[#efeae2] dark:bg-[#17181c]">
                <div 
                    className="absolute inset-0 pointer-events-none bg-[#9b6515]/10 dark:bg-[#4368fb]/10"
                    style={{
                    maskImage: "url('/bg-pattern.svg')",
                    WebkitMaskImage: "url('/bg-pattern.svg')",
                    maskRepeat: 'repeat',
                    WebkitMaskRepeat: 'repeat',
                    maskSize: '400px',
                    WebkitMaskSize: '400px',
                    }}
                />

                {/* Сообщения чата */}
                {messages.length === 0 ? (
                    // <div className="text-center text-xs text-gray-400 mt-10">
                    // Нет сообщений. Напишите первым или нажмите «Проверить сообщения».
                    // </div>

                    <div className="bg-white/90 dark:bg-[#1f2937]/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-6 rounded-2xl max-w-sm text-center flex flex-col items-center gap-3 shadow-xl">
                        <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl">
                            💬
                        </div>
                        <h3 className="text-gray-900 dark:text-white text-base font-semibold">
                            Нет сообщений.
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                            Напишите первым или нажмите «Проверить сообщения».
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col w-full max-w-[65%] px-3 py-2 text-sm leading-snug relative overflow-hidden ${
                        msg.sender === 'me'
                            ? 'ml-auto text-white rounded-[18px]'
                            : 'mr-auto bg-[#1d2733] text-white rounded-[18px]'
                        }`}
                        style={
                        msg.sender === 'me'
                            ? {
                                background:
                                'linear-gradient(239deg, #6c5ce7 0%, #5142e6 50%, #3f2be3 100%)',
                            }
                            : undefined
                        }
                    >
                        <span className="pr-12 text-[14px] whitespace-pre-wrap wrap-break-word">{msg.text}</span>
                        <div className="absolute right-2 bottom-1 flex items-center gap-1 text-[10px] text-gray-300/80 select-none">
                        <span>{msg.timestamp}</span>
                        {/* {msg.sender === 'me' && (
                            <span className="text-blue-200 text-[12px] font-bold">✓✓</span>
                        )} */}
                        </div>
                    </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-gray-dark border-t border-stroke dark:border-stroke-dark flex gap-2">
              <input
                type="text"
                placeholder="Введите сообщение..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-4 py-2 rounded-md border border-stroke dark:border-stroke-dark bg-transparent text-black dark:text-white focus:outline-none focus:border-primary text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition flex items-center justify-center"
              >
                <IoSendOutline className="w-5 h-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center overflow-y-auto p-4 space-y-3 relative bg-[#efeae2] dark:bg-[#17181c]">
            <div 
                className="absolute inset-0 pointer-events-none bg-[#9b6515]/10 dark:bg-[#4368fb]/10"
                style={{
                maskImage: "url('/bg-pattern.svg')",
                WebkitMaskImage: "url('/bg-pattern.svg')",
                maskRepeat: 'repeat',
                WebkitMaskRepeat: 'repeat',
                maskSize: '400px',
                WebkitMaskSize: '400px',
                }}
            />

            <div className="bg-white/90 dark:bg-[#1f2937]/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-6 rounded-2xl max-w-sm text-center flex flex-col items-center gap-3 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl">
                💬
              </div>
              <h3 className="text-gray-900 dark:text-white text-base font-semibold">
                Выберите чат
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                Введите номер телефона в поле слева, чтобы начать диалог.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};