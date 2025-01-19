import { dbOperation } from '../db'

export const timeSlotService = {
    getList() {
        return dbOperation('timeSlots', 'readonly', (store) => store.getAll())
    },

    add(timeSlot) {
        return dbOperation('timeSlots', 'readwrite', (store) => store.add(timeSlot))
    },

    update(timeSlot) {
        return dbOperation('timeSlots', 'readwrite', (store) => store.put(timeSlot))
    },

    delete(id) {
        return dbOperation('timeSlots', 'readwrite', (store) => store.delete(id))
    }
} 