export interface TokenPayload {
	fullName: string, 
	sub: number, 
	role: string,
}

export interface Token extends TokenPayload {
	iat: number,
	exp: number
}

export interface TokenSet {
  accessToken: string
  refreshToken: string
}