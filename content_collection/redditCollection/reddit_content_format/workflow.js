var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var textToSpeech = require('@google-cloud/text-to-speech');
var fs = require('fs');
var util = require('util');
var OpenAI = require("openai");
var dotenv = require('dotenv');
dotenv.config();
var client = new textToSpeech.TextToSpeechClient();
var openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY });
function list_input_files() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    fs.readdir("./input_content/text_storys", function (err, files) {
                        if (err) {
                            reject(err); // Reject the promise if there's an error
                        }
                        else {
                            var textFiles = files.filter(function (file) { return file.endsWith(".txt"); });
                            resolve(textFiles); // Resolve with the array of files
                        }
                    });
                })];
        });
    });
}
;
// Check if the input file has already been proccessed before.
function valid_input_files(input_files) {
    return __awaiter(this, void 0, void 0, function () {
        var valid_files_1, invalid_files, invalid_filesArray_1, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    valid_files_1 = [];
                    return [4 /*yield*/, fs.promises.readFile("./invalid_files/inv_txt.csv", 'utf8')];
                case 1:
                    invalid_files = _a.sent();
                    invalid_filesArray_1 = invalid_files.split(',').map(function (item) { return item.trim(); });
                    input_files.forEach(function (file) {
                        if (!invalid_filesArray_1.includes(file)) {
                            valid_files_1.push(file);
                            invalid_filesArray_1.push(file);
                        }
                    });
                    invalid_filesArray_1 = invalid_filesArray_1.join(',');
                    return [4 /*yield*/, fs.writeFile("./invalid_files/inv_txt.csv", invalid_filesArray_1, function (err) { console.log(err); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, valid_files_1]; // Return the array of file names
                case 3:
                    err_1 = _a.sent();
                    console.error('Error reading CSV file', err_1);
                    return [2 /*return*/, []]; // Return empty array in case of error
                case 4: return [2 /*return*/];
            }
        });
    });
}
;
function text_to_speech(valid_file) {
    return __awaiter(this, void 0, void 0, function () {
        var readFile, fileContent, request, response, writeFile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(valid_file);
                    readFile = util.promisify(fs.readFile);
                    return [4 /*yield*/, readFile("./input_content/text_storys/".concat(valid_file), 'utf8')];
                case 1:
                    fileContent = _a.sent();
                    request = {
                        input: { text: fileContent },
                        voice: { languageCode: 'en-AU', name: 'en-AU-Wavenet-B', ssmlGender: 'MALE' },
                        audioConfig: { audioEncoding: 'MP3', speakingRate: 1.2 }
                    };
                    return [4 /*yield*/, client.synthesizeSpeech(request)];
                case 2:
                    response = (_a.sent())[0];
                    writeFile = util.promisify(fs.writeFile);
                    return [4 /*yield*/, writeFile("./audio_dir/".concat(valid_file, ".mp3"), response.audioContent, 'binary')];
                case 3:
                    _a.sent();
                    console.log("Audio content written to file: ".concat(valid_file, ".mp3"));
                    return [2 /*return*/, null];
            }
        });
    });
}
function speech_to_text(valid_file) {
    return __awaiter(this, void 0, void 0, function () {
        var transcription, writeFile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, openai.audio.transcriptions.create({
                        file: fs.createReadStream("./audio_dir/".concat(valid_file, ".mp3")),
                        model: "whisper-1",
                        response_format: "srt"
                    })];
                case 1:
                    transcription = _a.sent();
                    writeFile = util.promisify(fs.writeFile);
                    return [4 /*yield*/, writeFile("./srt_dir/".concat(valid_file, ".srt"), transcription, 'utf8')];
                case 2:
                    _a.sent();
                    console.log("Transcription made, file: ".concat(valid_file));
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var listed_files, valid_files, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, list_input_files()];
                case 1:
                    listed_files = _a.sent();
                    return [4 /*yield*/, valid_input_files(listed_files)];
                case 2:
                    valid_files = _a.sent();
                    console.log("".concat(valid_files.length, " files, to be processed."));
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < valid_files.length)) return [3 /*break*/, 7];
                    console.log("Made it to the innner loop");
                    return [4 /*yield*/, text_to_speech(valid_files[i])];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, speech_to_text(valid_files[i])];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    i++;
                    return [3 /*break*/, 3];
                case 7: return [2 /*return*/];
            }
        });
    });
}
;
main();
