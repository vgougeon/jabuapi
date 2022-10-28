import { Braces, Calendar, Database, FileText, FloatLeft, Heading, Id, FileUpload, Keyboard, KeyboardShow, Line, Mail, Math, Number0, RelationManyToMany, RelationOneToMany, RelationOneToOne, Shield, ShieldCheck, ToggleLeft, CalendarEvent, CalendarTime, Fingerprint, List } from "tabler-icons-react"

export const TYPES = [
    { name: 'ID', canOmit: true, description: 'Auto increments ID', icon: <Database />, class: 'bg-gray-600', category: 'Fields' },
    { name: 'STRING', canOmit: false, description: 'Basic string (max 255 characters)', icon: <Keyboard />, class: 'bg-green-400', category: 'Fields' },
    { name: 'INTEGER', canOmit: false, description: 'Number, no decimals', icon: <Number0 />, class: 'bg-teal-400', category: 'Fields' },
    { name: 'FLOAT', canOmit: false, description: 'Number, with decimals', icon: <Math />, class: 'bg-cyan-400', category: 'Fields' },
    { name: 'DATE', canOmit: false, description: 'Timestamp format', icon: <Calendar />, class: 'bg-emerald-400', category: 'Fields' },
    { name: 'BOOLEAN', canOmit: false, description: 'True or False', icon: <ToggleLeft />, class: 'bg-blue-400', category: 'Fields' },
    { name: 'TEXT', canOmit: false, description: 'Long texts', icon: <FileText />, class: 'bg-orange-400', category: 'Fields' },
    { name: 'EMAIL', canOmit: false, description: 'Mail address', icon: <Mail />, class: 'bg-yellow-400', category: 'Fields' },
    { name: 'PASSWORD', canOmit: false, description: 'Encrypted and hidden', icon: <ShieldCheck />, class: 'bg-blue-500', category: 'Fields' },
    { name: 'RICHTEXT', canOmit: false, description: 'Rich text with WYSIWYG editor', icon: <FloatLeft />, class: 'bg-pink-400', category: 'Fields' },
    { name: 'JSON', canOmit: false, description: 'Store your JSON objects', icon: <Braces />, class: 'bg-blue-400', category: 'Fields' },
    { name: 'CREATED_AT', canOmit: true, description: 'Element creation date', icon: <CalendarEvent />, class: 'bg-indigo-400', category: 'Fields' },
    { name: 'UPDATED_AT', canOmit: true, description: 'Element update date', icon: <CalendarTime />, class: 'bg-pink-400', category: 'Fields' },
    { name: 'IP', canOmit: true, description: 'Automatically store IP on insertion, and authentication', icon: <Fingerprint />, class: 'bg-blue-400', category: 'Fields' },
    { name: 'ENUM', canOmit: false, description: 'Custom set of possible values (string)', icon: <List />, class: 'bg-green-400', category: 'Fields' },

    { name: 'ONE TO ONE', canOmit: true, description: 'Relation 1 to 1', icon: <RelationOneToOne />, class: 'bg-red-400', category: 'Relations' },
    { name: 'ASYMMETRIC', canOmit: true, description: 'Either many to one or one to many', icon: <Line />, class: 'bg-red-400', category: 'Relations' },
    { name: 'MANY TO MANY', canOmit: true, description: 'Can have multiple target, and target too', icon: <RelationManyToMany />, class: 'bg-red-400', category: 'Relations' },
    { name: 'ORDERED LIST', canOmit: true, description: 'Many to many with lexorank order', icon: <RelationManyToMany />, class: 'bg-pink-400', category: 'Relations' },
    { name: 'MEDIA', canOmit: true, description: 'Relation to a file', icon: <FileUpload />, class: 'bg-purple-400', category: 'Relations' },
]

export function getType(name) {
    return TYPES.find(type => type.name === name)
}