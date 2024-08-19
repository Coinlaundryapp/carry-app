import { useSession } from 'next-auth/react';
import { fetchExtended } from './api-client';
import { ApiResponse, AuthResponse } from '@/types/api-types';

// const session = useSession();
// const accessToken = session.data?.user?.accessToken;
// console.log('access', accessToken);

export async function getAddresses(accessToken: string) {
  const res = await fetchExtended<ApiResponse<AuthResponse>>(
    '/api/v1/users/me/shipping-addresses',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const data = res.body.data;
  return data;
}

export async function getAddressesList() {
  const res = await fetchExtended<ApiResponse<AuthResponse>>(
    '/api/v1/addresses?query=잠실동&pageSize=5&pageNumber=0',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        
      },
    },
  );
  const data = res.body.data;
  return data;
}

export async function getAddress(accessToken: string, addressId: string) {
  const res = await fetchExtended<ApiResponse<AuthResponse>>(
    `/api/v1/users/me/shipping-addresses/${addressId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const data = res.body.data;
  return data;
}

export async function postAddress(accessToken: string, addressId: string, newAddress: any) {
  const res = await fetchExtended<ApiResponse<AuthResponse>>(
    `/api/v1/users/me/shipping-addresses`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: newAddress,
    },
  );
  const data = res.body.data;
  return data;
}

export async function putAddress(accessToken: string, addressId: string, editAddress: any) {
  const res = await fetchExtended<ApiResponse<AuthResponse>>(
    `/api/v1/users/me/shipping-addresses/${addressId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: editAddress,
    },
  );
  const data = res.body.data;
  return data;
}

export async function deleteAddress(accessToken: string, addressId: string, editAddress: any) {
  const res = await fetchExtended<ApiResponse<AuthResponse>>(
    `/api/v1/users/me/shipping-addresses/${addressId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: editAddress,
    },
  );
  const data = res.body.data;
  return data;
}
