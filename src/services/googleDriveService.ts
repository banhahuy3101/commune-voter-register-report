/**
 * Google Drive API v3 Service
 * Handles sharing, permissions, and collaborator list for Google Sheets
 */
import { Collaborator } from '../types/sheet';

const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';

/**
 * Shares a Google Sheet with a person via email
 */
export async function shareSpreadsheetWithEmail(
  accessToken: string,
  fileId: string,
  emailAddress: string,
  role: 'writer' | 'reader' = 'writer',
  sendNotification: boolean = true
): Promise<any> {
  const url = `${DRIVE_API}/${fileId}/permissions?sendNotificationEmail=${sendNotification}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role,
      type: 'user',
      emailAddress,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to share file: ${errorText}`);
  }

  return await res.json();
}

/**
 * Grants link-sharing access ("Anyone with link can edit / view")
 */
export async function setGeneralLinkAccess(
  accessToken: string,
  fileId: string,
  role: 'writer' | 'reader'
): Promise<any> {
  const url = `${DRIVE_API}/${fileId}/permissions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role,
      type: 'anyone',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to set general link access: ${err}`);
  }

  return await res.json();
}

/**
 * List all collaborators and permissions on the spreadsheet
 */
export async function listFileCollaborators(
  accessToken: string,
  fileId: string
): Promise<Collaborator[]> {
  const url = `${DRIVE_API}/${fileId}/permissions?fields=permissions(id,displayName,emailAddress,role,type,photoLink)`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    console.warn('Could not list drive permissions directly:', await res.text());
    return [];
  }

  const json = await res.json();
  const perms = json.permissions || [];

  return perms.map((p: any) => ({
    id: p.id,
    displayName: p.displayName || (p.type === 'anyone' ? 'អ្នកណាមានតំណភ្ជាប់ (Anyone with link)' : p.emailAddress || 'អ្នកសហការ'),
    emailAddress: p.emailAddress || (p.type === 'anyone' ? 'Link Access' : '—'),
    role: p.role === 'owner' ? 'owner' : p.role === 'writer' ? 'writer' : 'reader',
    photoLink: p.photoLink,
  }));
}

/**
 * Removes a collaborator's access
 */
export async function removeCollaboratorAccess(
  accessToken: string,
  fileId: string,
  permissionId: string
): Promise<void> {
  const url = `${DRIVE_API}/${fileId}/permissions/${permissionId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to remove permission: ${err}`);
  }
}
