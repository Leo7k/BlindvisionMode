//Скрипт  версии сайта для слабовидящих
//https://github.com/Leo7k/BlindvisionMode/
//Требуется: jQuery
//Лицензия: GPLv3
"use strict";

/*
CSS-селекторы элементов, на которых должна срабатывать озвучка при фокусе или наведении мыши:
*/
var BLINDVISION_SPEAK_ON_EVENT = {
	mouseover: [
		"a",
		"button",
		"label",
		"img",
		"article",
		"form",
		"header h1",
		"main article header"
	],
	focus: [
		"a",
		"button"
	]
};


var BLINDVISION_ELEMENT_IDS = {
	CONFIG_DIALOG: "#blindvisionconfig-dialog",
	CONFIG_FORM: "#blindvisionconfig",
	CONTROL_WEBTTS_CHECKBOX: "#bvcontrol-webtts",
	TXT_WEBTTS_WARNING: "#tts_warning",
	BTN_SHOW_DIALOG: "#visiontoggle",
	BTN_APPLY: "#bvcontrol_apply",
	BTN_CLOSE: "#bvcontrol_cancel",
	BTN_APPLY_AND_CLOSE: "#bvcontrol_ok",
	BTN_RESET_TO_DEFAULT: "#bvcontrol_resetbtn"
};

var BLINDVISION_BUTTON_CLICK_HANDLERS = {
	BTN_SHOW_DIALOG: blindvisionConfigLoadAndShow,
	BTN_APPLY: blindvisionConfigSaveAndApply,
	BTN_CLOSE: blindvisionConfigCloseDialog,
	BTN_APPLY_AND_CLOSE: blindvisionConfigApplyAndClose,
	BTN_RESET_TO_DEFAULT: blindvisionConfigReset
};

var blindvisionCSSFilters = {};

var BLINDVISION_INPUT_TYPES_CHECKED = {
	checkbox: true,
	radio: true
};


//Режим для слабовидящих
function blindvisionLoadScheme() {
	for (var btnConst in BLINDVISION_BUTTON_CLICK_HANDLERS) {
		$(BLINDVISION_ELEMENT_IDS[btnConst]).click(BLINDVISION_BUTTON_CLICK_HANDLERS[btnConst]);
	}
	blindvisionConfigStateRead();
	blindvisionConfigApply();
}

function blindvisionConfigStateRead() {
	var controlelements = $(BLINDVISION_ELEMENT_IDS.CONFIG_FORM).get(0).elements;
	for (var i = 0; i < controlelements.length; i++) {
		var element = controlelements[i];
		if (element.hasAttribute("data-styletype"))	{
			var strValue = localStorage.getItem(element.name);
			if (BLINDVISION_INPUT_TYPES_CHECKED[element.type]) {
				element.checked = (strValue === element.value);
			}
			if ((strValue !== undefined) && (strValue !== null) && (strValue.length > 0)) {
				element.value = strValue;
			}
		}
	}
}

function blindvisionConfigStateWrite() {
	var controlelements = $(BLINDVISION_ELEMENT_IDS.CONFIG_FORM).get(0).elements;
	for (var i = 0; i < controlelements.length; i++) {
		var element = controlelements[i];
		if (element.hasAttribute("data-styletype"))	{
			if ((!BLINDVISION_INPUT_TYPES_CHECKED[element.type]) || element.checked) {
				localStorage.setItem(element.name, element.value);
			}
			else {
				localStorage.removeItem(element.name);
			}
		}
	}
}

function blindvisionConfigLoadAndShow() {
	blindvisionConfigStateRead();
	$(BLINDVISION_ELEMENT_IDS.CONFIG_DIALOG).css("display", "block");
	$(document.body).css("overflow", "hidden");
	blindvisionConfigDisplayWebTTSStatus();
}

function blindvisionConfigGetActualValue(element, dataElement) {
	var actualvalue = element.value;
	if (dataElement.hasAttribute("data-valueprefix"))	{
		actualvalue = dataElement.getAttribute("data-valueprefix") + actualvalue;
	}
	if (dataElement.hasAttribute("data-valuepostfix")) {
		actualvalue = actualvalue + dataElement.getAttribute("data-valuepostfix");
	}
	return actualvalue;
}

function bvcontrolApplyChange(element) {
	var lastValue = localStorage.getItem(element.name);
	var nodeType = element.nodeName.toLowerCase();
	var currentState = false;
	var styletype = element.hasAttribute("data-styletype") ? element.getAttribute("data-styletype") : "";
	currentState = BLINDVISION_INPUT_TYPES_CHECKED[element.type] ? element.checked : true;
	var selector = element.getAttribute("data-selector");
	var actualvalue = element.value;
	var nodeType = element.nodeName.toLowerCase();
	var selectedElements = $(selector);
	if (currentState) {
		if (styletype == "class") {
			if (nodeType == "select") {
				var opts = element.options;
				for (var j = 0; j < opts.length; j++) {
					var opt = opts.item(j);
   					if (!opt.selected) {
						selectedElements.removeClass(blindvisionConfigGetActualValue(opt, element));
					}
				}
				var selectedOption = opts[element.selectedIndex];
				if (selectedOption && selectedOption.selected) {
					actualvalue = blindvisionConfigGetActualValue(selectedOption, element);
				}
			}
			else if ((typeof lastValue == "string") && lastValue.length > 0) {
				selectedElements.removeClass(lastValue);
			}
			selectedElements.addClass(actualvalue);
		}
		else if (styletype == "inline")	{
			selectedElements.css(element.getAttribute("data-styleprop"), blindvisionConfigGetActualValue(element, element));
		}
		else if ((styletype == "filter") && element.hasAttribute("data-filtertype")) {
			if (!blindvisionCSSFilters[selector]) {
				blindvisionCSSFilters[selector] = {};
			}
			var filterType = element.getAttribute("data-filtertype");
			if (filterType.length > 0)	{
					blindvisionCSSFilters[selector][filterType] = element;
			}
		}
	}
	else {
		if (styletype == "class") {
			selectedElements.removeClass(actualvalue);
			if (nodeType == "select") {
				var opts = element.options;
				for (var j = 0; j < opts.length; j++) {
			   		selectedElements.removeClass(blindvisionConfigGetActualValue(element, opts.item(j)));
				}
			}
		}
		else if ((styletype == "inline") && element.hasAttribute("data-styleprop")) {
			selectedElements.css(element.getAttribute("data-styleprop"), "inherit");
		}
	}
}

function blindvisionConfigApplyWebTTSSettings() {
	blindvisionConfigDisplayWebTTSStatus();   
	var enableTTS_Checkbox = $(BLINDVISION_ELEMENT_IDS.CONTROL_WEBTTS_CHECKBOX);
	if (enableTTS_Checkbox.prop('checked') && !enableTTS_Checkbox.prop('disabled'))	{
		var voice = blindvisionWebTTS_GetVoice();
		if (voice)	{
			blindvisionWebTTS_enableSpeech();
		}
	}
	else {
		blindvisionWebTTS_disableSpeech();
	}
}

function blindvisionConfigReset() {
	var controlelements = $(BLINDVISION_ELEMENT_IDS.CONFIG_FORM).get(0).elements;
	for (var i = 0; i < controlelements.length; i++) {
		var element = controlelements[i];
		if (element.hasAttribute("data-styletype"))	{
			localStorage.removeItem(element.name);
		}
	}
	return true;
}

function blindvisionConfigApplyAndClose() {
	blindvisionConfigSaveAndApply();
	return blindvisionConfigCloseDialog();
}

function blindvisionConfigCloseDialog() {
	$(BLINDVISION_ELEMENT_IDS.CONFIG_DIALOG).css("display", "none")
	$(document.body).css("overflow", "visible");
	return true;
}

function blindvisionConfigSaveAndApply() {
	blindvisionConfigStateWrite();
	return blindvisionConfigApply();
}

function blindvisionConfigApply() {
	var controlelements = $(BLINDVISION_ELEMENT_IDS.CONFIG_FORM).get(0).elements;
	for (var i = 0; i < controlelements.length; i++) {
		bvcontrolApplyChange(controlelements[i]);
	}
	for (var selector in blindvisionCSSFilters) {
		var filterString = "";
		var cnt = 0;
		for (var filterType in blindvisionCSSFilters[selector]) {
			var filterControl = blindvisionCSSFilters[selector][filterType];
			if (filterControl.defaultValue !== filterControl.value) {
				filterString = filterString + filterType+"("+blindvisionConfigGetActualValue(filterControl, filterControl) + ") ";
				cnt++;
			}
		}
		if (cnt > 0) {
			$(selector).css("filter", filterString);
		}
		else {
			$(selector).css("filter", "none");
		}
	}
	blindvisionConfigApplyWebTTSSettings();
	return true;
}

function blindvisionConfigDisplayWebTTSStatus() {
	var voice = blindvisionWebTTS_GetVoice();
	if (voice) {
	        $(BLINDVISION_ELEMENT_IDS.CONTROL_WEBTTS_CHECKBOX).prop("disabled", false);
	        $(BLINDVISION_ELEMENT_IDS.TXT_WEBTTS_WARNING).css("display", "none");
	}
	else {
		var synth = window.webkitSpeechSynthesis || window.speechSynthesis;
		if (synth) {
			synth.onvoiceschanged = blindvisionConfigDisplayWebTTSStatus;
		}
	}
}

function blindvisionWebTTS_disableSpeech() {
	for (var eventType in BLINDVISION_SPEAK_ON_EVENT) {
		for (var i = 0; i < BLINDVISION_SPEAK_ON_EVENT[eventType].length; i++) {
			$(BLINDVISION_SPEAK_ON_EVENT[eventType][i]).off(eventType, blindvisionWebTTS_SpeakElementContent);
		}
	}
	$(document).off("keydown", blindvisionWebTTS_processSpeechHotkey);
}

// ------------------------ //

function blindvisionWebTTS_GetVoice() {
	var synth = window.webkitSpeechSynthesis || window.speechSynthesis;
	if (synth) {
		var voices = synth.getVoices();
		if (voices.length > 0) {
			for (var i = 0; i < voices.length; i++) {
				var lang = voices[i].lang;
				var name = voices[i].name;
				if ((lang == "ru") || (lang == "ru-RU") || (name == "Aleksandr") || (name == "Anna") || (name == "Irina")) {
					return voices[i];
				}
			}
			//Если нет установленных наборов голосов, искать SpeakIt или набор по умолчанию (в старых Chrome).
			for (var i = 0; i < voices.length; i++)	{
				var name = voices[i].name;
				if ((name == "SpeakIt") || (name == "SpeakIt!") || (name == "(native)")) {
					return voices[i];
				}
			}
		}
	}
	return null;
}

function blindvisionWebTTS_onSpeechEnd(evt) {
	var utterance = evt.target;
	var element = utterance.forElement;
	if (element) {
		element.webTTSUtterance = undefined;
	}
	else {
		console.warn("Связанный с произносимой фразой элемент потерян (удален)!");
	}
	utterance.forElement = undefined;
}

function blindvisionWebTTS_SpeakElementContent(evt) {
	var element = evt.target;
	if (element.hasAttribute("aria-hidden")) {
		var ariaHidden = element.getAttribute("aria-hidden");
		if (ariaHidden == "true") {
			return;
		}
	}
	if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
		if (element.webTTSUtterance) {
			console.log("Уже произносится: "+element.webTTSUtterance.text);
			return;
		}
		window.speechSynthesis.cancel();
	}
	var textToSpeak = "";
	//1. Текст находится в другом элементе, указанном по стандарту WAI ARIA
	if (element.hasAttribute("aria-labelledby")) {
		var labelId = element.getAttribute("aria-labelledby");
		if ((labelId != null) && labelId.length > 0)	{
			var labelElement = document.getElementById(labelId);
			if (labelElement) {
				element = document.getElementById(labelId);
			}
		}
	}
	//2. Текст находится в атрибуте, указанном по стандарту WAI ARIA
	if (element.hasAttribute("aria-label")) {
		textToSpeak = element.getAttribute("aria-label");
	}
	//3. Текст находится в самом элементе
	if (textToSpeak.length < 1) {
		textToSpeak = element.textContent;
	}
	//4. Текст находится во всплывающей подсказке
	if (textToSpeak.length < 1) {
		if (element.hasAttribute("title")) {
			textToSpeak = element.getAttribute("title");
		}
	}
	//5. Текст находится в атрибуте alt для изображений и видео
	if (textToSpeak.length < 1) {
		if ((element.tagName == "IMG") || (element.tagName == "VIDEO"))	{
		   if (element.hasAttribute("alt")) {
				textToSpeak = element.getAttribute("alt");
		   }
		}
	}
	//6. Текста нет
	if (textToSpeak.length < 1) {
		console.log("Нет текста для произнесения");
		return;
	}
	var utterance = new SpeechSynthesisUtterance();
	utterance.text = textToSpeak;
	element.webTTSUtterance = utterance;
	utterance.forElement = element;
	utterance.addEventListener("end", blindvisionWebTTS_onSpeechEnd);
	console.log("Произносим: "+utterance.text);
	window.speechSynthesis.speak(utterance);
}

//control - прервать
//shift или pause break - приостановить/возобновить

function blindvisionWebTTS_processSpeechHotkey(evt) {
	if (evt.shiftKey) {
		if (window.speechSynthesis.paused)	{
			window.speechSynthesis.resume();
		}
		else if (window.speechSynthesis.speaking) {
			window.speechSynthesis.pause();
		}
	}
	else if (evt.ctrlKey) {
		window.speechSynthesis.cancel();
		evt.target._is_speaking = undefined;
	}
}

function blindvisionWebTTS_enableSpeech() {
	for (var eventType in BLINDVISION_SPEAK_ON_EVENT) {
		for (var i = 0; i < BLINDVISION_SPEAK_ON_EVENT[eventType].length; i++) {
			$(BLINDVISION_SPEAK_ON_EVENT[eventType][i]).on(eventType, blindvisionWebTTS_SpeakElementContent);
		}
	}
	$(document).keydown(blindvisionWebTTS_processSpeechHotkey);
}

$(document).ready(blindvisionLoadScheme);