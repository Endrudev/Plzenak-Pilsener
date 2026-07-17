import { supabase } from './supabase'

// Map DB snake_case → app camelCase
function mapRow(row) {
    return {
        id:          row.id,
        name:        row.name,
        date:        row.date,
        dateShort:   row.date_short,
        location:    row.location,
        tags:        row.tags        ?? [],
        badge:       row.badge,
        badgeType:   row.badge_type,
        imgClass:    row.img_class,
        url:         row.url,
        description: row.description ?? [],
        mapSrc:      row.map_src,
    }
}

// Map app camelCase → DB snake_case
function mapToRow(event) {
    return {
        name:        event.name,
        date:        event.date        || null,
        date_short:  event.dateShort   || null,
        location:    event.location    || null,
        tags:        event.tags        ?? [],
        badge:       event.badge       || null,
        badge_type:  event.badgeType   || null,
        img_class:   event.imgClass    || null,
        url:         event.url         || null,
        description: event.description ?? [],
        map_src:     event.mapSrc      || null,
    }
}

export async function getEvents() {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('id')
    if (error) throw error
    return data.map(mapRow)
}

export async function getEventById(id) {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()
    if (error) throw error
    return mapRow(data)
}

export async function createEvent(event) {
    const { data, error } = await supabase
        .from('events')
        .insert([mapToRow(event)])
        .select()
        .single()
    if (error) throw error
    return mapRow(data)
}

export async function updateEvent(id, event) {
    const { data, error } = await supabase
        .from('events')
        .update(mapToRow(event))
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return mapRow(data)
}

export async function deleteEvent(id) {
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
    if (error) throw error
}
