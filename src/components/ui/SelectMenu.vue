<template>
  <Listbox as="div" :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" :disabled="disabled">
    <ListboxLabel v-if="label" class="block text-sm/6 font-medium text-gray-900">{{ label }}</ListboxLabel>
    <div class="relative mt-2">
      <ListboxButton :class="[
        'grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 border border-gray-300 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6',
        disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
      ]">
        <span class="col-start-1 row-start-1 truncate pr-6">
          {{ displayValue }}
        </span>
        <ChevronUpDownIcon class="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4" aria-hidden="true" />
      </ListboxButton>

      <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 shadow-lg ring-black/5 focus:outline-hidden sm:text-sm">
          <ListboxOption 
            as="template" 
            v-for="option in options" 
            :key="getOptionKey(option)" 
            :value="option" 
            v-slot="{ active, selected }"
          >
            <li :class="[
              active ? 'bg-indigo-600 text-white outline-hidden' : 'text-gray-900', 
              'relative cursor-default py-2 pr-9 pl-3 select-none'
            ]">
              <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">
                {{ getOptionLabel(option) }}
              </span>

              <span 
                v-if="selected" 
                :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4']"
              >
                <CheckIcon class="size-5" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { ChevronUpDownIcon } from '@heroicons/vue/16/solid'
import { CheckIcon } from '@heroicons/vue/20/solid'

interface SelectOption {
  [key: string]: any;
}

const props = defineProps<{
  modelValue: any;
  options: SelectOption[];
  label?: string;
  valueKey?: string;
  labelKey?: string;
  disabled?: boolean;
  placeholder?: string;
}>()

defineEmits<{
  (e: 'update:modelValue', value: any): void;
}>()

const getOptionKey = (option: SelectOption): string | number => {
  if (props.valueKey && typeof option === 'object') {
    return option[props.valueKey];
  }
  return typeof option === 'object' ? option.id || option.value : option;
}

const getOptionLabel = (option: SelectOption): string => {
  if (props.labelKey && typeof option === 'object') {
    return option[props.labelKey];
  }
  return typeof option === 'object' ? option.name || option.label : String(option);
}

const displayValue = computed(() => {
  if (!props.modelValue) {
    return props.placeholder || 'Select an option';
  }
  return getOptionLabel(props.modelValue);
})
</script>
