import type { components, operations } from './generated/openapi';

export type Schema<K extends keyof components['schemas']> = components['schemas'][K];
export type Me = Schema<'MeResponse'>;
export type Task = Schema<'TaskResponse'>;
export type Period = Schema<'PeriodResponse'>;
export type FeedMessage = Schema<'FeedMessageResponse'>;
export type Role = Schema<'Role'>;
export type Gender = Schema<'Gender'>;
export type Problem = Schema<'Problem'>;
export type Operation = keyof operations;
export type Body<K extends Operation> = operations[K] extends { requestBody: { content: { 'application/json': infer B } } } ? B : never;
type Json<T> = T extends { content: { 'application/json': infer R } } ? R : void;
export type Result<K extends Operation> = Json<operations[K]['responses'][Extract<keyof operations[K]['responses'], 200 | 201 | 204>]>;
export type Query<K extends Operation> = operations[K] extends { parameters: { query?: infer Q } } ? Q : never;
