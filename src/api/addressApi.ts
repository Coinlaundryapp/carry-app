import { GetAddressesResType } from '@/types/address-type';
import { fetchExtended } from './api-client';
import { ApiResponse, TGetAddressSearchListRes, TAddressRes } from '@/types/api-types';

export async function getAddresses(accessToken: string | undefined) {
  const res = await fetchExtended<ApiResponse<GetAddressesResType>>(
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

export async function getAddressSearchList(keyword: string, page: number) {
  const res = await fetchExtended<ApiResponse<TGetAddressSearchListRes>>(
    `/api/v1/addresses?query=${keyword}&pageSize=5&pageNumber=${page}`,
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

export async function getAddress(accessToken: string | undefined, addressId: string | string[]) {
  const res = await fetchExtended<ApiResponse<TAddressRes>>(
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

export async function postAddress(accessToken: string, newAddress: any) {
  const res = await fetchExtended(`/api/v1/users/me/shipping-addresses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: newAddress,
  });

  const data = res;
  return data;
}

export async function putAddress(
  accessToken: string,
  addressId: string | string[],
  editAddress: any,
) {
  const res = await fetchExtended(`/api/v1/users/me/shipping-addresses/${addressId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: editAddress,
  });

  const data = res;
  return data;
}

export async function deleteAddress(accessToken: string, addressId: string | string[]) {
  const res = await fetchExtended(`/api/v1/users/me/shipping-addresses/${addressId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = res;
  return data;
}

export async function patchDefaultAddress(accessToken: string, addressId: string | string[]) {
  const res = await fetchExtended(`/api/v1/users/me/shipping-addresses/${addressId}/default`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = res;
  return data;
}
