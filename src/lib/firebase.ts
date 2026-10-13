/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Firebase decommissioned: Application uses Supabase exclusively for Database and Storage.
 * This stub file prevents legacy import breakages.
 */

export function getFirebaseApp(): null {
  return null;
}

export function getFirestoreDB(): null {
  return null;
}

export function isFirebaseConnected(): boolean {
  return false;
}

export async function fetchCollectionFromFirestore<T extends { id: string }>(
  _collectionName: string
): Promise<T[]> {
  return [];
}

export async function saveDocumentToFirestore<T extends { id: string }>(
  _collectionName: string,
  _item: T
): Promise<boolean> {
  return false;
}

export async function deleteDocumentFromFirestore(
  _collectionName: string,
  _id: string
): Promise<boolean> {
  return false;
}

export async function saveManyDocumentsToFirestore<T extends { id: string }>(
  _collectionName: string,
  _items: T[]
): Promise<boolean> {
  return false;
}

export function subscribeToCollection<T extends { id: string }>(
  _collectionName: string,
  _onUpdate: (items: T[]) => void,
  _onError?: (err: Error) => void
): () => void {
  return () => {};
}
