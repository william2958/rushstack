// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

/**
 * A library for loading config files for use with the
 * {@link https://rushstack.io/pages/heft/overview/ | Heft} build system.
 *
 * @packageDocumentation
 */

export {
  ConfigurationFile,
  type IConfigurationFileOptionsBase,
  type IConfigurationFileOptionsWithJsonSchemaFilePath,
  type IConfigurationFileOptionsWithJsonSchemaObject,
  type IConfigurationFileOptions,
  type ICustomJsonPathMetadata,
  type ICustomPropertyInheritance,
  type IJsonPathMetadataResolverOptions,
  type IJsonPathMetadata,
  type IJsonPathsMetadata,
  InheritanceType,
  type INonCustomJsonPathMetadata,
  type IOriginalValueOptions,
  type IPropertiesInheritance,
  type IPropertyInheritance,
  type IPropertyInheritanceDefaults,
  PathResolutionMethod,
  type PropertyInheritanceCustomFunction
} from './ConfigurationFile';
