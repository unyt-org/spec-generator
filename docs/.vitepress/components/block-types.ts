// block-types.ts
export const Category = {
    red: '#f9015a',
    green: '#29b570',
    blue: '#1a87ad',
    yellow: '#dfa72e',
	purple: '#893fd0',
    gray: '#6B7280',
    dark_blue: '#592edf',
}

export type Category = keyof typeof Category;

export type ByteSection = {
  name: string;
  group?: string;
  category: Category;
  byteSize: number;
  optional?: boolean;
};


export const routingHeader = [
	{ name: "version", category: "purple", byteSize: 1 },
	{ name: "distance", category: "red", byteSize: 1 },
	{ name: "ttl", category: "green", byteSize: 1 },
	{ name: "flags", category: "yellow", byteSize: 1 },
	{ name: "size_small", category: "yellow", byteSize: 2, optional: true, group: "size" },
	{ name: "size_large", category: "yellow", byteSize: 4, optional: true, group: "size" },

	{ name: "sender_type", category: "blue", byteSize: 1, group: "sender" },
	{ name: "sender_id", category: "blue", byteSize: 18, group: "sender" },
	{ name: "sender_inst", category: "blue", byteSize: 2, group: "sender" },
] as const satisfies ByteSection[];

export const blockHeader: ByteSection[] = [
	{ name: "context_id", category: "purple", byteSize: 4, group: "context" },
	{ name: "section_index", category: "purple", byteSize: 2, group: "context" },
	{ name: "block_number", category: "purple", byteSize: 2, group: "context" },
	{ name: "flags_timestamp", category: "green", byteSize: 8 },
	{ name: "lifetime", category: "red", byteSize: 4 },
	{ name: "repr_type", category: "blue", byteSize: 1, group: "repr", optional: true },
	{ name: "repr_id", category: "blue", byteSize: 18, group: "repr", optional: true },
	{ name: "repr_inst", category: "blue", byteSize: 2, group: "repr", optional: true },
	{ name: "iv", category: "yellow", byteSize: 16, optional: true },

];
export const encryptedHeader: ByteSection[] = [
	{ name: "enc_flags", category: "yellow", byteSize: 1 },
	{ name: "behalf_type", category: "blue", byteSize: 1, group: "behalf" },
	{ name: "behalf_id", category: "blue", byteSize: 18, group: "behalf" },
	{ name: "behalf_inst", category: "blue", byteSize: 2, group: "behalf" },
];
export const body: ByteSection[] = [];

type SectionData<T extends string> = {
	[key in T]: {
		field: key,
		bytes: number[],
		parsedData?: string,
	}
}[T][]

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