import { GetAddressesResType, AddressPayload } from '@features/address/types/address-type';
import { fetchExtended } from '@shared/api/api-client';
import { ApiResponse, TGetAddressSearchListRes, TAddressRes, Address } from '@shared/types/api-types';

export async function getAddresses(accessToken: string | undefined) {
  const res = await fetchExtended<ApiResponse<GetAddressesResType>>(
    '/api/v1/users/me/shipping-addresses',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-cache',
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
      cache: 'no-cache',
    },
  );

  const data = res.body.data;
  return data;
}

export async function getAddress(
  accessToken: string | undefined,
  addressId: string | string[] | number,
) {
  const res = await fetchExtended<ApiResponse<TAddressRes>>(
    `/api/v1/users/me/shipping-addresses/${addressId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-cache',
    },
  );

  const data = res.body.data;
  return data;
}

export async function postAddress(accessToken: string, newAddress: AddressPayload) {
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
  editAddress: AddressPayload,
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

export async function getDefaultAddress(accessToken: string | undefined) {
  const res = await fetchExtended<ApiResponse<Address>>(`/api/v1/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-cache',
  });

  const data = res.body.data;
  return data;
}
