// frontend/src/services/notificationService.ts
import axios from 'axios';
import { Notification } from '@/types/notification';

const API_URL = process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'https://user-service-3j2j.onrender.com';

const getAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/**
 * Fetches notifications for the logged-in user.
 * @param token - The authentication token.
 * @returns A promise that resolves to an array of notifications.
 */
const getNotifications = async (token: string): Promise<Notification[]> => {
  try {
    const response = await axios.get<Notification[]>(`${API_URL}/api/notifications`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

/**
 * Marks specific notifications as read.
 * @param token - The authentication token.
 * @param notificationIds - An array of notification IDs to mark as read.
 * @returns A promise that resolves when the operation is complete.
 */
const markNotificationsAsRead = async (token: string, notificationIds: number[]): Promise<void> => {
  try {
    await axios.post(`${API_URL}/api/notifications/mark-read`, { notificationIds }, getAuthHeaders(token));
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
};

/**
 * Marks all unread notifications as read for the user.
 * @param token - The authentication token.
 * @returns A promise that resolves when the operation is complete.
 */
const markAllNotificationsAsRead = async (token: string): Promise<void> => {
  try {
    await axios.post(`${API_URL}/api/notifications/mark-all-read`, {}, getAuthHeaders(token));
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const notificationService = {
  getNotifications,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
};