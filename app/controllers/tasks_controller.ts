import Task from '#models/task';
import User from '#models/user';
import { taskPatchValidator, taskValidator } from '#validators/task';
import type { HttpContext } from '@adonisjs/core/http'

export default class TasksController {
    public async create({ request, response }: HttpContext) {
        const data = await request.all();
        const payload = await taskValidator.validate(data);
        const user = (request as any).user as User;
        const task = await Task.create({...payload, userId: user.id });
        return response.created(task);
    }

    public async show({ request, response }: HttpContext) {
        const user = (request as any).user as User;
        const taskId = request.param('id');
        const task = await Task.query().where('id', taskId).where('userId', user.id).first();

        if (!task) {
            return response.notFound({ message: 'Task not found' });
        }

        return response.ok(task);
    }

    public async index({ request, response }: HttpContext) {
        const user = (request as any).user as User;
        const tasks = await Task.query().where('userId', user.id)
        return response.ok(tasks);
    }

    public async destroy({ request, response }: HttpContext) {
        const user = (request as any).user as User;
        const taskId = request.param('id');
        const task = await Task.query().where('id', taskId).where('userId', user.id).first();

        if (!task) {
            return response.notFound({ message: 'Task not found' });
        }

        await task.delete();
        return response.noContent();
    }

    public async update({ request, response }: HttpContext) {
        const user = (request as any).user as User;
        const taskId = request.param('id');
        const data = await request.all();
        const payload = await taskValidator.validate(data);
        const task = await Task.query().where('id', taskId).where('userId', user.id).first();

        if (!task) {
            return response.notFound({ message: 'Task not found' });
        }

        task.merge(payload);
        await task.save();
        return response.ok(task);
    }

    public async patch({ request, response }: HttpContext) {
        const user = (request as any).user as User;
        const taskId = request.param('id');
        const data = await request.all();
        const payload = await taskPatchValidator.validate(data);
        const task = await Task.query().where('id', taskId).where('userId', user.id).first();

        if (!task) {
            return response.notFound({ message: 'Task not found' });
        }

        task.merge(payload);
        await task.save();
        return response.ok(task);
    }

}