import { param, format, playlog } from 'masao';
import { Game, MasaoCategory, ResourceKind } from './data';
export { param, format, playlog };
export declare const resources: Record<string, string>;
export declare const resourceKeys: string[];
export declare const resourceKinds: Record<ResourceKind, string>;
export declare const resourceToKind: Record<string, ResourceKind>;
export declare function validateParams(params: Record<string, string>): boolean;
export declare function removeResources(params: Record<string, string>): void;
export declare function removeInvalidParams(params: Record<string, string>): Record<string, string>;
export declare function validateVersion(version: string): boolean;
export declare function validateResourceKind(kind: string): kind is ResourceKind;
export declare function localizeGame(game: Game, domain?: string | null): {
    [x: string]: string;
};
export declare function getLastStage(params: Record<string, string>): number;
export declare function versionCategory(version: string): MasaoCategory;
export declare function categoryToVersion(category: MasaoCategory): string;
