// block-types.ts
export const Category = {
    red: '#f9015a',
    green: '#29b570',
    blue: '#1a87ad',
    yellow: '#dfa72e',
	purple: '#893fd0',
    gray: '#6B7280',
    dark_blue: '#2e37df',
}

export type Category = keyof typeof Category;

export type ByteSection = {
  name: string;
  group?: string;
  category: Category;
  byteSize: number;
  bitMasks?: BitMask[];
  repeat?: string; // name of the field that indicates how many times to repeat
  if?: (parts: SectionData<string>) => boolean; // condition to include this field
  parseValue?: (data: number[]) => unknown; // function to compute the parsed value based on other fields
};


export type BitMask = {
	name: string;
	length?: number; // number of bits (default 1)
	parseValue?: (data: number) => unknown; // function to compute the parsed value based on other fields
}


export const routingHeader = [
	{ name: "magic_number", category: "purple", byteSize: 2 },
	{ 
		name: "version", category: "purple", byteSize: 1,
		parseValue: data => Number(data[0])
	},
	{ name: "block_size", category: "red", byteSize: 2 },
	{ 
		name: "flags", 
		category: "red", 
		byteSize: 1,
		bitMasks: [
			{
				name: 'signature_type',
				length: 2,
				parseValue: data => {
					switch (data) {
						case 0b00: return 'None';
						case 0b10: return 'Unencrypted';
						case 0b11: return 'Encrypted';
						default: return 'Unknown';
					}
				}
			},
			{
				name: 'encryption_type',
				length: 1,
			},
			{
				name: 'receiver_type',
				length: 2,
				parseValue: data => {
					switch (data) {
						case 0b00: return 'None';
						case 0b01: return 'Pointer';
						case 0b10: return 'Receivers';
						case 0b11: return 'ReceiversWithKeys';
					}
				}
			},
			{
				name: 'is_bounce_back',
				length: 1,
				parseValue: data => Boolean(data),
			},
			{
				name: 'has_checksum',
				length: 1,
				parseValue: data => Boolean(data),
			},
		]
	},

	{ name: "checksum", category: "yellow", byteSize: 4 },

	{ name: "distance", category: "green", byteSize: 1 },
	{ name: "ttl", category: "green", byteSize: 1 },

	{ name: "sender", category: "blue", byteSize: 21 },

	{ 
		name: "receivers_pointer_id", category: "dark_blue", byteSize: 26, group: "receivers", 
		if: data => resolveFieldPath('flags.receiver_type', data) === 'Pointer'
	},
	{ 
		name: "receivers_count", category: "dark_blue", byteSize: 1, group: "receivers", 
		if: data => ['Receivers', 'ReceiversWithKeys'].includes(resolveFieldPath('flags.receiver_type', data))
	},
	{ 
		name: "receivers_endpoints", category: "dark_blue", byteSize: 21, group: "receivers", repeat: "receivers_endpoints_count", 
		if: data => resolveFieldPath('flags.receiver_type', data) === 'Receivers'
	},
	{ 
		name: "receivers_endpoints_with_keys", category: "dark_blue", byteSize: 21, group: "receivers", repeat: "receivers_endpoints_count", 
		if: data => resolveFieldPath('flags.receiver_type', data) === 'ReceiversWithKeys'
	},

	{ 
		name: "signature", category: "yellow", byteSize: 255, group: "signature", 
		if: data => resolveFieldPath('flags.signature_type', data) === 'Unencrypted'
	},
	{ 
		name: "encrypted_signature", category: "yellow", byteSize: 300, group: "signature", 
		if: data => resolveFieldPath('flags.signature_type', data) === 'Encrypted'
	},

] as const satisfies ByteSection[];

export const blockHeader = [
	{ name: "context_id", category: "purple", byteSize: 4, group: "context" },
	{ name: "section_index", category: "purple", byteSize: 2, group: "context" },
	{ name: "block_number", category: "purple", byteSize: 2, group: "context" },
	{ name: "flags_timestamp", category: "red", byteSize: 8 },
	{ name: "lifetime", category: "red", byteSize: 4 },
	{ name: "repr", category: "blue", byteSize: 21 },
	{ name: "iv", category: "yellow", byteSize: 16 },
] as const satisfies ByteSection[];

export const encryptedHeader = [
	{ 
		name: "enc_flags", category: "red", byteSize: 1, 
		bitMasks: [
			{
				name: 'user_agent',
				length: 4,
			},
			{
				name: 'has_on_behalf_of',
				length: 1,
				parseValue: data => Boolean(data),
			}
		]
	},
	{ 
		name: "behalf", category: "blue", byteSize: 21, 
		if: data => resolveFieldPath('enc_flags.has_on_behalf_of', data) === true
	},
] as const satisfies ByteSection[];

export const body = [] as const satisfies ByteSection[];

type SectionData<T extends string> = {
	[key in T]: {
		name: key,
		bytes: number[],
		parsedValue?: unknown,
		subFields?: {
			name: string,
			parsedValue: unknown,
		}[]
	}
}[T][]

type SectionDefinitionData<T extends string> = {
	[key in T]?: number[]
}

export type BlockData = [
	{
		section: "routingHeader",
		parts: SectionData<typeof routingHeader[number]['name']>,
	},
	{ 
		section: "blockHeader",
		parts: SectionData<typeof blockHeader[number]['name']>,
	},
	{ 
		section: "encryptedHeader",
		parts: SectionData<typeof encryptedHeader[number]['name']>,
	},
	{ 
		section: "body",
		parts: SectionData<typeof body[number]['name']>,
	},
]


export type ExampleBlockDefinition = {
	routingHeader?: SectionDefinitionData<typeof routingHeader[number]['name']>,
	blockHeader?: SectionDefinitionData<typeof blockHeader[number]['name']>,
	encryptedHeader?: SectionDefinitionData<typeof encryptedHeader[number]['name']>,
	body?: SectionDefinitionData<typeof body[number]['name']>,
}

export function generateExampleBlock(definition: ExampleBlockDefinition): number[] {
	return [
		...processSection(routingHeader, definition.routingHeader).map(p => p.bytes).flat(),
		...processSection(blockHeader, definition.blockHeader).map(p => p.bytes).flat(),
		...processSection(encryptedHeader, definition.encryptedHeader).map(p => p.bytes).flat(),
		...processSection(body, definition.body).map(p => p.bytes).flat(),
	].flat();
}

function processSection<T extends string>(sectionDef: ByteSection[], sectionDefinitionData?: SectionDefinitionData<T>): SectionData<string> {
	const parts: SectionData<string> = [];

	for (const field of sectionDef) {
		const value = sectionDefinitionData?.[field.name];

		// skip field if condition not met
		const conditionMet = field.if?.(parts) ?? true;
		if (!conditionMet) continue;
		
		let bytes: number[] = [];
		if (value) {
			// assert value length matches field.byteSize
			if (value.length !== field.byteSize) {
				throw new Error(`Field ${field.name} expects ${field.byteSize} bytes, but got ${value.length}`);
			}
			bytes = value;
		}
		else {
			// Fill with zeros if not provided
			bytes = new Array(field.byteSize).fill(0);
		}

		// add part
		parts.push({ 
			name: field.name, 
			bytes,
			parsedValue: field.parseValue ? field.parseValue(bytes) : null,
			subFields: field.bitMasks ? parseBitMasks(bytes, field.bitMasks) : undefined,
		});
	}
	return parts;
}


export function parseDXBBlock(data: number[]): BlockData {
	let offset = 0;

	function readBytes(size: number): number[] {
		const bytes = data.slice(offset, offset + size);
		offset += size;
		return bytes;
	}

	function parseSection(sectionDef: ByteSection[]): SectionData<string> {
		const parts: SectionData<string> = [];

		for (const field of sectionDef) {
			// check condition
			const conditionMet = field.if?.(parts) ?? true;
			if (!conditionMet) continue;

			// determine repeat count
			let repeatCount = 1;
			if (field.repeat) {
				const repeatField = parts.find(part => part.name === field.repeat);
				if (repeatField) {
					// ensure it's a number
					if (typeof repeatField.parsedValue !== 'number') {
						throw new Error(`Repeat field ${field.repeat} is not a number`);
					}
					repeatCount = repeatField.parsedValue;
				}
			}

			for (let i = 0; i < repeatCount; i++) {
				const bytes = readBytes(field.byteSize);
				parts.push({
					name: field.name,
					bytes,
					parsedValue: field.parseValue ? field.parseValue(bytes) : null,
					subFields: field.bitMasks ? parseBitMasks(bytes, field.bitMasks) : undefined,
				});
			}
		}
		return parts;
	}

	return [
		{ section: "routingHeader", parts: parseSection(routingHeader) as BlockData[0]['parts'] },
		{ section: "blockHeader", parts: parseSection(blockHeader) as BlockData[1]['parts'] },
		{ section: "encryptedHeader", parts: parseSection(encryptedHeader) as BlockData[2]['parts'] },
		{ section: "body", parts: parseSection(body) as BlockData[3]['parts'] },
	];
}

function parseBitMasks(bytes: number[], bitMasks: BitMask[]): {name: string, parsedValue: unknown}[] {
	const bitArray = bytes.map(byte => byte.toString(2).padStart(8, '0')).join('');
	let offset = 0;
	const results: {name: string, parsedValue: unknown}[] = [];
	for (const mask of bitMasks) {
		const length = mask.length ?? 1;
		const bitData = bitArray.slice(offset, offset + length);
		const intValue = parseInt(bitData, 2);
		const parsedValue = mask.parseValue ? mask.parseValue(intValue) : intValue;
		results.push({ name: mask.name, parsedValue });
		offset += length;
	}

	return results;
}

function resolveFieldPath<T>(path: string, data: SectionData<string>): T {
	const parts = path.split('.');
	if (parts.length > 2) throw new Error(`Invalid field path: ${path}`);
	const [fieldName, subFieldName] = parts;
	const field = data.find(d => d.name === fieldName);
	if (!subFieldName) return field?.parsedValue as T;
	return field?.subFields?.find(f => f.name === subFieldName)?.parsedValue as T;
}